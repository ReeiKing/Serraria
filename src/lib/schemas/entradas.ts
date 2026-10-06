import { z } from "zod"

import {
  zInteiro,
  zNumeroBR,
  zNumeroBROpcional,
  zTextoOpcional,
  zUfOpcional,
  zUuid,
  zUuidOpcional,
} from "@/lib/validacao"

export const MODOS_MEDICAO = [
  {
    valor: "m3",
    rotulo: "Metro cúbico",
    sigla: "m³",
    unidade: "m3",
    descricao: "Diâmetro e comprimento de cada tora",
  },
  {
    valor: "estereo",
    rotulo: "Metro estéreo",
    sigla: "st",
    unidade: "st",
    descricao: "Comprimento × largura × altura da carga",
  },
  {
    valor: "tonelada",
    rotulo: "Tonelada",
    sigla: "t",
    unidade: "t",
    descricao: "Peso na balança menos a tara",
  },
] as const

export type ModoMedicao = (typeof MODOS_MEDICAO)[number]["valor"]

export const UNIDADE_DO_MODO: Record<ModoMedicao, "m3" | "st" | "t"> = {
  m3: "m3",
  estereo: "st",
  tonelada: "t",
}
export const SIGLA_UNIDADE: Record<string, string> = { m3: "m³", st: "st", t: "t" }

export const toraItemSchema = z.object({
  diametroCm: zNumeroBR({ maiorQueZero: true, max: 300, rotulo: "Diâmetro" }),
  comprimentoM: zNumeroBR({ maiorQueZero: true, max: 30, rotulo: "Comprimento" }),
  quantidade: zInteiro({ min: 1, rotulo: "Quantidade" }),
})

export const entradaToraSchema = z
  .object({
    especieId: zUuid("a espécie"),
    fornecedorId: zUuid("o fornecedor"),
    motoristaId: zUuidOpcional,
    veiculoId: zUuidOpcional,
    placa: z
      .string()
      .transform((v) => v.toUpperCase().replace(/[^A-Z0-9]/g, ""))
      .transform((v) => (v === "" ? null : v)),
    origem: zTextoOpcional,
    municipioOrigem: zTextoOpcional,
    ufOrigem: zUfOpcional,
    documentoFlorestal: zTextoOpcional,
    modoMedicao: z.enum(["m3", "estereo", "tonelada"]),
    cargaComprimentoM: zNumeroBROpcional({ min: 0, max: 30, rotulo: "Comprimento" }),
    cargaLarguraM: zNumeroBROpcional({ min: 0, max: 5, rotulo: "Largura" }),
    cargaAlturaM: zNumeroBROpcional({ min: 0, max: 6, rotulo: "Altura" }),
    pesoBrutoKg: zNumeroBROpcional({ min: 0, max: 200000, rotulo: "Peso bruto" }),
    taraKg: zNumeroBROpcional({ min: 0, max: 100000, rotulo: "Tara" }),
    toras: z.array(
      z.object({ diametroCm: z.string(), comprimentoM: z.string(), quantidade: z.string() })
    ),
    valorUnitario: zNumeroBR({ min: 0, rotulo: "Valor unitário" }),
    observacoes: zTextoOpcional,
  })
  .superRefine((e, ctx) => {
    const falta = (campo: string, msg: string) =>
      ctx.addIssue({ code: "custom", path: [campo], message: msg })
    if (e.modoMedicao === "estereo") {
      if (!e.cargaComprimentoM) falta("cargaComprimentoM", "Informe o comprimento da carga")
      if (!e.cargaLarguraM) falta("cargaLarguraM", "Informe a largura da carga")
      if (!e.cargaAlturaM) falta("cargaAlturaM", "Informe a altura da carga")
    }
    if (e.modoMedicao === "tonelada") {
      if (!e.pesoBrutoKg) falta("pesoBrutoKg", "Informe o peso bruto")
      if (e.taraKg === null) falta("taraKg", "Informe a tara")
      if (e.pesoBrutoKg && e.taraKg !== null && e.pesoBrutoKg <= e.taraKg)
        falta("pesoBrutoKg", "Peso bruto deve ser maior que a tara")
    }
    if (e.modoMedicao === "m3") {
      const linhas = e.toras.filter((t) => t.diametroCm || t.comprimentoM)
      if (linhas.length === 0) falta("toras", "Lance pelo menos uma tora")
      linhas.forEach((t, i) => {
        const r = toraItemSchema.safeParse(t)
        if (!r.success)
          ctx.addIssue({
            code: "custom",
            path: ["toras", i, String(r.error.issues[0]?.path[0] ?? "diametroCm")],
            message: r.error.issues[0]?.message ?? "Inválido",
          })
      })
    }
  })

export const pagamentoSchema = z.object({
  dataPagamento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  valor: zNumeroBR({ maiorQueZero: true, rotulo: "Valor" }),
  forma: z.enum(["dinheiro", "pix", "transferencia", "boleto", "cheque", "outro"]),
  observacao: zTextoOpcional,
})

export const FORMAS_PAGAMENTO = [
  { valor: "pix", rotulo: "PIX" },
  { valor: "transferencia", rotulo: "Transferência" },
  { valor: "dinheiro", rotulo: "Dinheiro" },
  { valor: "boleto", rotulo: "Boleto" },
  { valor: "cheque", rotulo: "Cheque" },
  { valor: "outro", rotulo: "Outro" },
] as const
