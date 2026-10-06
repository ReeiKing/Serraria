import "server-only"

import { asc, eq, sql } from "drizzle-orm"

import { especies, estoqueItens, qualidades, type Tx } from "@/db"

/** Itens de estoque com nomes e o preço de venda vigente (para o valor estimado). */
export async function listarEstoque(tx: Tx) {
  return tx
    .select({
      id: estoqueItens.id,
      especieId: estoqueItens.especieId,
      especie: especies.nome,
      qualidadeId: estoqueItens.qualidadeId,
      qualidade: qualidades.nome,
      qualidadeOrdem: qualidades.ordem,
      espessuraCm: estoqueItens.espessuraCm,
      larguraCm: estoqueItens.larguraCm,
      comprimentoM: estoqueItens.comprimentoM,
      volumePecaM3: estoqueItens.volumePecaM3,
      saldoPecas: estoqueItens.saldoPecas,
      saldoM3: estoqueItens.saldoM3,
      estoqueMinimoPecas: estoqueItens.estoqueMinimoPecas,
      precoM3: sql<string | null>`(
        select pv.valor from public.precos_vigentes pv
         where pv.tipo = 'venda_serrada' and pv.especie_id = ${estoqueItens.especieId}
           and pv.qualidade_id = ${estoqueItens.qualidadeId} and pv.unidade = 'm3')`,
    })
    .from(estoqueItens)
    .innerJoin(especies, eq(especies.id, estoqueItens.especieId))
    .innerJoin(qualidades, eq(qualidades.id, estoqueItens.qualidadeId))
    .orderBy(
      asc(especies.nome),
      asc(estoqueItens.espessuraCm),
      asc(estoqueItens.larguraCm),
      asc(estoqueItens.comprimentoM),
      asc(qualidades.ordem)
    )
}

export type ItemEstoque = Awaited<ReturnType<typeof listarEstoque>>[number]

export function situacaoEstoque(i: { saldoPecas: number; estoqueMinimoPecas: number }) {
  if (i.saldoPecas < 0) return "negativo" as const
  if (i.saldoPecas === 0) return "zerado" as const
  if (i.estoqueMinimoPecas > 0 && i.saldoPecas <= i.estoqueMinimoPecas) return "baixo" as const
  return "ok" as const
}
