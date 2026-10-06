import { NextResponse } from "next/server"

import { comUsuario, empresas } from "@/db"
import { gerarRelatorioExcel } from "@/lib/excel"
import { gerarRelatorioPdf } from "@/lib/pdf/relatorio"
import { gerarRelatorio } from "@/lib/relatorios"

import { lerParametros } from "../parametros"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const params = Object.fromEntries(url.searchParams)
  const { tipo, filtros } = lerParametros(params)
  const formato = params.formato === "pdf" ? "pdf" : "xlsx"

  const [relatorio, [empresa]] = await comUsuario((tx) =>
    Promise.all([
      gerarRelatorio(tx, tipo, filtros),
      tx
        .select({ nome: empresas.nomeFantasia, razao: empresas.razaoSocial })
        .from(empresas)
        .limit(1),
    ])
  )
  const nomeEmpresa = empresa?.nome || empresa?.razao || "Serraria"
  const base = `relatorio-${tipo}-${filtros.periodo.de}-a-${filtros.periodo.ate}`

  if (formato === "pdf") {
    const pdf = await gerarRelatorioPdf(relatorio, nomeEmpresa)
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${base}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    })
  }
  const xlsx = await gerarRelatorioExcel(relatorio, nomeEmpresa)
  return new NextResponse(new Uint8Array(xlsx), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${base}.xlsx"`,
      "Cache-Control": "private, no-store",
    },
  })
}
