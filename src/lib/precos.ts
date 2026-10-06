import "server-only"

import { sql } from "drizzle-orm"

import type { Tx } from "@/db"

export type PrecoVigente = {
  id: string
  tipo: "compra_tora" | "venda_serrada"
  especieId: string
  qualidadeId: string | null
  unidade: "st" | "m3" | "t"
  valor: string
}

/** Todos os preços vigentes hoje (fuso de São Paulo), para sugerir nos formulários. */
export async function precosVigentes(tx: Tx): Promise<PrecoVigente[]> {
  const linhas = await tx.execute<{
    id: string
    tipo: PrecoVigente["tipo"]
    especie_id: string
    qualidade_id: string | null
    unidade: PrecoVigente["unidade"]
    valor: string
  }>(sql`select id, tipo, especie_id, qualidade_id, unidade, valor from public.precos_vigentes`)
  return linhas.map((l) => ({
    id: l.id,
    tipo: l.tipo,
    especieId: l.especie_id,
    qualidadeId: l.qualidade_id,
    unidade: l.unidade,
    valor: l.valor,
  }))
}
