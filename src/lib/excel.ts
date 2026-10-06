import "server-only"

import { TZDate } from "@date-fns/tz"
import ExcelJS from "exceljs"

import { FUSO_HORARIO } from "@/lib/format"
import { totais, type Relatorio } from "@/lib/relatorios"

const FORMATOS: Record<string, string> = {
  moeda: '"R$" #,##0.00',
  m3: "#,##0.000",
  numero: "#,##0.000",
  inteiro: "#,##0",
  pct: '0.0"%"',
  data: "dd/mm/yyyy",
  datahora: "dd/mm/yyyy hh:mm",
}

/** Excel não tem fuso: grava a hora "de parede" de São Paulo. */
function paraDataExcel(v: string | number, soData: boolean) {
  if (soData && typeof v === "string" && v.length === 10) {
    const [a, m, d] = v.split("-").map(Number)
    return new Date(Date.UTC(a!, m! - 1, d!))
  }
  const z = new TZDate(new Date(v), FUSO_HORARIO)
  return new Date(
    Date.UTC(z.getFullYear(), z.getMonth(), z.getDate(), z.getHours(), z.getMinutes())
  )
}

export async function gerarRelatorioExcel(r: Relatorio, empresa: string) {
  const wb = new ExcelJS.Workbook()
  wb.creator = empresa
  const ws = wb.addWorksheet(r.titulo.slice(0, 31), { views: [{ state: "frozen", ySplit: 4 }] })

  ws.mergeCells(1, 1, 1, r.colunas.length)
  ws.getCell(1, 1).value = `${empresa} — ${r.titulo}`
  ws.getCell(1, 1).font = { bold: true, size: 14, color: { argb: "FF7A4A24" } }
  ws.mergeCells(2, 1, 2, r.colunas.length)
  ws.getCell(2, 1).value = r.subtitulo
  ws.getCell(2, 1).font = { italic: true, color: { argb: "FF6B5A4A" } }

  const cab = ws.getRow(4)
  r.colunas.forEach((c, i) => {
    const cel = cab.getCell(i + 1)
    cel.value = c.rotulo
    cel.font = { bold: true, color: { argb: "FFFFFFFF" } }
    cel.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF7A4A24" } }
    cel.alignment = { vertical: "middle" }
  })

  r.linhas.forEach((l, k) => {
    const row = ws.getRow(5 + k)
    r.colunas.forEach((c, i) => {
      const v = l[c.chave]
      const cel = row.getCell(i + 1)
      if (v === null || v === undefined || v === "") return
      if (c.tipo === "data" || c.tipo === "datahora")
        cel.value = paraDataExcel(v, c.tipo === "data")
      else if (c.tipo === "texto") cel.value = String(v)
      else cel.value = Number(v)
      if (FORMATOS[c.tipo]) cel.numFmt = FORMATOS[c.tipo]!
    })
  })

  const t = totais(r)
  const linhaTotal = ws.getRow(5 + r.linhas.length)
  linhaTotal.getCell(1).value = `${r.linhas.length} registros`
  r.colunas.forEach((c, i) => {
    if (!c.total) return
    const cel = linhaTotal.getCell(i + 1)
    cel.value = t[c.chave] ?? 0
    cel.numFmt = FORMATOS[c.tipo] ?? "General"
  })
  linhaTotal.font = { bold: true }
  linhaTotal.eachCell(
    (cel) => (cel.border = { top: { style: "medium", color: { argb: "FF7A4A24" } } })
  )

  r.colunas.forEach((c, i) => {
    ws.getColumn(i + 1).width = c.tipo === "texto" ? 28 : c.tipo === "datahora" ? 17 : 14
  })
  ws.autoFilter = {
    from: { row: 4, column: 1 },
    to: { row: 4 + r.linhas.length, column: r.colunas.length },
  }

  return Buffer.from(await wb.xlsx.writeBuffer())
}
