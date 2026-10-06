import { z } from "zod"

import {
  zData,
  zInteiro,
  zNumeroBR,
  zNumeroBROpcional,
  zTextoOpcional,
  zUuid,
} from "@/lib/validacao"

export const pecaSchema = z.object({
  espessuraCm: zNumeroBR({ maiorQueZero: true, max: 50, rotulo: "Espessura" }),
  larguraCm: zNumeroBR({ maiorQueZero: true, max: 100, rotulo: "Largura" }),
  comprimentoM: zNumeroBR({ maiorQueZero: true, max: 12, rotulo: "Comprimento" }),
  qualidadeId: zUuid("a qualidade"),
  quantidade: zInteiro({ min: 1, max: 1_000_000, rotulo: "Quantidade" }),
})

export const producaoSchema = z.object({
  dataProducao: zData,
  especieId: zUuid("a espécie"),
  torasConsumidasM3: zNumeroBROpcional({ min: 0, max: 10_000, rotulo: "Toras consumidas" }),
  observacoes: zTextoOpcional,
  itens: z.array(pecaSchema).min(1, "Lance pelo menos uma linha de peças"),
})

export const MOTIVOS_AJUSTE = [
  { valor: "inventario", rotulo: "Inventário (contagem)" },
  { valor: "perda", rotulo: "Perda" },
  { valor: "quebra", rotulo: "Quebra" },
  { valor: "outro", rotulo: "Outro" },
] as const

export const ajusteSchema = z
  .object({
    especieId: zUuid("a espécie"),
    qualidadeId: zUuid("a qualidade"),
    espessuraCm: zNumeroBR({ maiorQueZero: true, max: 50, rotulo: "Espessura" }),
    larguraCm: zNumeroBR({ maiorQueZero: true, max: 100, rotulo: "Largura" }),
    comprimentoM: zNumeroBR({ maiorQueZero: true, max: 12, rotulo: "Comprimento" }),
    sentido: z.enum(["entrada", "saida"]),
    quantidade: zInteiro({ min: 1, rotulo: "Quantidade" }),
    motivo: z.enum(["inventario", "perda", "quebra", "outro"]),
    observacao: zTextoOpcional,
    permitirNegativo: z.boolean(),
  })
  .refine((a) => a.motivo !== "outro" || !!a.observacao, {
    path: ["observacao"],
    message: "Descreva o motivo",
  })

export const estornoSchema = z.object({
  motivo: z.string().trim().min(5, "Explique o motivo do estorno"),
  permitirNegativo: z.boolean(),
})

// ---------------------------------------------------------------- produtos por unidade
export const producaoProdutosSchema = z.object({
  dataProducao: zData,
  observacoes: zTextoOpcional,
  itens: z
    .array(
      z.object({
        produtoId: zUuid("o produto"),
        quantidade: zInteiro({ min: 1, max: 1_000_000, rotulo: "Quantidade" }),
      })
    )
    .min(1, "Lance pelo menos um produto"),
})

export const ajusteProdutoSchema = z
  .object({
    produtoId: zUuid("o produto"),
    sentido: z.enum(["entrada", "saida"]),
    quantidade: zInteiro({ min: 1, rotulo: "Quantidade" }),
    motivo: z.enum(["inventario", "perda", "quebra", "outro"]),
    observacao: zTextoOpcional,
    permitirNegativo: z.boolean(),
  })
  .refine((a) => a.motivo !== "outro" || !!a.observacao, {
    path: ["observacao"],
    message: "Descreva o motivo",
  })
