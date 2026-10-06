import "server-only"

import { eq } from "drizzle-orm"
import type { PgColumn, PgTable } from "drizzle-orm/pg-core"
import { revalidatePath } from "next/cache"
import type { z } from "zod"

import { comUsuario } from "@/db"

import { executar, type Resultado } from "./acoes"

type TabelaComId = PgTable & { id: PgColumn }
type TabelaComAtivo = TabelaComId & { ativo: PgColumn }

/** Valida com o schema e insere (id null) ou atualiza o registro. */
export function salvarRegistro<S extends z.ZodType>(
  tabela: TabelaComId,
  schema: S,
  id: string | null,
  entrada: unknown,
  caminho: string
): Promise<Resultado<{ id: string }>> {
  return executar(async () => {
    const dados = schema.parse(entrada) as Record<string, unknown>
    const [r] = await comUsuario((tx) =>
      id
        ? tx
            .update(tabela)
            .set(dados as never)
            .where(eq(tabela.id, id))
            .returning({ id: tabela.id })
        : tx
            .insert(tabela)
            .values(dados as never)
            .returning({ id: tabela.id })
    )
    if (!r) throw new Error("Registro não encontrado.")
    revalidatePath(caminho)
    return { id: r.id as string }
  })
}

export function excluirRegistro(
  tabela: TabelaComId,
  id: string,
  caminho: string
): Promise<Resultado<void>> {
  return executar(async () => {
    await comUsuario((tx) => tx.delete(tabela).where(eq(tabela.id, id)))
    revalidatePath(caminho)
  })
}

export function definirAtivo(
  tabela: TabelaComAtivo,
  id: string,
  ativo: boolean,
  caminho: string
): Promise<Resultado<void>> {
  return executar(async () => {
    await comUsuario((tx) =>
      tx
        .update(tabela)
        .set({ ativo } as never)
        .where(eq(tabela.id, id))
    )
    revalidatePath(caminho)
  })
}
