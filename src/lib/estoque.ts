import "server-only"

import { and, eq } from "drizzle-orm"

import { estoqueItens, type Tx } from "@/db"
import { paraNumeric } from "@/lib/calculos"

/** Acha (ou cria, com saldo zero) o item de estoque da bitola espécie + medida + qualidade. */
export async function obterItemEstoque(
  tx: Tx,
  b: {
    especieId: string
    qualidadeId: string
    espessuraCm: number
    larguraCm: number
    comprimentoM: number
  }
): Promise<string> {
  const chave = and(
    eq(estoqueItens.especieId, b.especieId),
    eq(estoqueItens.qualidadeId, b.qualidadeId),
    eq(estoqueItens.espessuraCm, paraNumeric(b.espessuraCm, 2)),
    eq(estoqueItens.larguraCm, paraNumeric(b.larguraCm, 2)),
    eq(estoqueItens.comprimentoM, paraNumeric(b.comprimentoM, 3))
  )
  const [existente] = await tx.select({ id: estoqueItens.id }).from(estoqueItens).where(chave)
  if (existente) return existente.id
  const [novo] = await tx
    .insert(estoqueItens)
    .values({
      especieId: b.especieId,
      qualidadeId: b.qualidadeId,
      espessuraCm: paraNumeric(b.espessuraCm, 2),
      larguraCm: paraNumeric(b.larguraCm, 2),
      comprimentoM: paraNumeric(b.comprimentoM, 3),
    })
    .onConflictDoNothing()
    .returning({ id: estoqueItens.id })
  if (novo) return novo.id
  // criado em paralelo por outra transação
  const [outro] = await tx.select({ id: estoqueItens.id }).from(estoqueItens).where(chave)
  return outro!.id
}
