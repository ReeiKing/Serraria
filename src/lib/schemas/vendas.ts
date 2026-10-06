import { z } from "zod"

import {
  zCepOpcional,
  zCodigoIbgeOpcional,
  zInteiro,
  zNumeroBR,
  zNumeroBROpcional,
  zTextoOpcional,
  zUfOpcional,
  zUuid,
  zUuidOpcional,
} from "@/lib/validacao"

export const itemVendaSchema = z.object({
  estoqueItemId: zUuid("o item do estoque"),
  quantidade: zInteiro({ min: 1, rotulo: "Quantidade" }),
  precoM3: zNumeroBR({ min: 0, rotulo: "Preço por m³" }),
})

export const vendaSchema = z
  .object({
    clienteId: zUuid("o cliente"),
    motoristaId: zUuidOpcional,
    veiculoId: zUuidOpcional,
    placa: z
      .string()
      .transform((v) => v.toUpperCase().replace(/[^A-Z0-9]/g, ""))
      .transform((v) => (v === "" ? null : v)),
    destinoCep: zCepOpcional,
    destinoLogradouro: zTextoOpcional,
    destinoNumero: zTextoOpcional,
    destinoComplemento: zTextoOpcional,
    destinoBairro: zTextoOpcional,
    destinoMunicipio: zTextoOpcional,
    destinoCodigoIbge: zCodigoIbgeOpcional,
    destinoUf: zUfOpcional,
    tipoFrete: z.enum(["cif", "fob", "sem_frete"]),
    valorFrete: zNumeroBROpcional({ min: 0, rotulo: "Frete" }).transform((v) => v ?? 0),
    desconto: zNumeroBROpcional({ min: 0, rotulo: "Desconto" }).transform((v) => v ?? 0),
    documentoFlorestal: zTextoOpcional,
    observacoes: zTextoOpcional,
    itens: z.array(itemVendaSchema).min(1, "Adicione pelo menos um item"),
  })
  .superRefine((v, ctx) => {
    const vistos = new Set<string>()
    v.itens.forEach((i, k) => {
      if (vistos.has(i.estoqueItemId))
        ctx.addIssue({
          code: "custom",
          path: ["itens", k, "estoqueItemId"],
          message: "Item repetido — some a quantidade na mesma linha",
        })
      vistos.add(i.estoqueItemId)
    })
  })

export const cancelamentoVendaSchema = z.object({
  motivo: z.string().trim().min(5, "Explique o motivo do cancelamento"),
})
