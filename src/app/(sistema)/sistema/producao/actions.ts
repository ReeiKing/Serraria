"use server"

import { eq, isNull, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { comUsuario, estoqueMov, estoqueTorasMov, producoes, producoesItens } from "@/db"
import { executar } from "@/lib/acoes"
import { paraNumeric } from "@/lib/calculos"
import { obterItemEstoque } from "@/lib/estoque"
import { calcularProducao } from "@/lib/producao"
import { estornoSchema, producaoSchema } from "@/lib/schemas/producao"

function revalidar() {
  revalidatePath("/sistema/producao")
  revalidatePath("/sistema/estoque")
  revalidatePath("/sistema")
}

export async function salvarProducao(entrada: unknown) {
  return executar(async () => {
    const d = producaoSchema.parse(entrada)
    const calc = calcularProducao(d.itens, d.torasConsumidasM3)

    const id = await comUsuario(async (tx) => {
      const [p] = await tx
        .insert(producoes)
        .values({
          dataProducao: d.dataProducao,
          especieId: d.especieId,
          torasConsumidasM3:
            d.torasConsumidasM3 === null ? null : paraNumeric(d.torasConsumidasM3, 6),
          volumeSerradoM3: paraNumeric(calc.volumeSerradoM3, 6),
          totalPecas: calc.totalPecas,
          rendimentoPercentual: calc.rendimento === null ? null : paraNumeric(calc.rendimento, 3),
          observacoes: d.observacoes,
        })
        .returning({ id: producoes.id, numero: producoes.numero })
      const producao = p!

      for (const [i, item] of d.itens.entries()) {
        const itemId = await obterItemEstoque(tx, { ...item, especieId: d.especieId })
        const linha = calc.linhas[i]!
        await tx.insert(producoesItens).values({
          producaoId: producao.id,
          estoqueItemId: itemId,
          quantidade: item.quantidade,
          volumePecaM3: paraNumeric(linha.volumePecaM3, 6),
          volumeTotalM3: paraNumeric(linha.volumeTotalM3, 6),
        })
        await tx.insert(estoqueMov).values({
          estoqueItemId: itemId,
          tipo: "producao",
          quantidade: item.quantidade,
          producaoId: producao.id,
          observacao: `Produção nº ${producao.numero}`,
        })
      }

      // Baixa das toras consumidas (em m³)
      if (d.torasConsumidasM3) {
        await tx.insert(estoqueTorasMov).values({
          especieId: d.especieId,
          tipo: "consumo",
          quantidade: paraNumeric(-d.torasConsumidasM3, 6),
          unidade: "m3",
          producaoId: producao.id,
        })
      }
      return producao.id
    })

    revalidar()
    return { id }
  })
}

/** Estorna a produção lançando movimentos inversos (o kardex não é apagado). */
export async function estornarProducao(id: string, entrada: unknown) {
  return executar(async () => {
    const { motivo, permitirNegativo } = estornoSchema.parse(entrada)
    await comUsuario(async (tx) => {
      const [p] = await tx
        .update(producoes)
        .set({ estornadaEm: new Date().toISOString(), motivoEstorno: motivo })
        .where(and(eq(producoes.id, id), isNull(producoes.estornadaEm)))
        .returning({
          numero: producoes.numero,
          especieId: producoes.especieId,
          toras: producoes.torasConsumidasM3,
        })
      if (!p) throw new Error("Produção não encontrada ou já estornada.")

      const itens = await tx.select().from(producoesItens).where(eq(producoesItens.producaoId, id))
      for (const item of itens) {
        await tx.insert(estoqueMov).values({
          estoqueItemId: item.estoqueItemId,
          tipo: "producao",
          quantidade: -item.quantidade,
          producaoId: id,
          permitirNegativo,
          observacao: `Estorno da produção nº ${p.numero}: ${motivo}`,
        })
      }
      if (p.toras && Number(p.toras) > 0) {
        await tx.insert(estoqueTorasMov).values({
          especieId: p.especieId,
          tipo: "ajuste",
          quantidade: p.toras,
          unidade: "m3",
          producaoId: id,
          motivo: `Estorno da produção nº ${p.numero}`,
        })
      }
    })
    revalidar()
  })
}
