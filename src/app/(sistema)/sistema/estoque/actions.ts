"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { comUsuario, estoqueItens, estoqueMov } from "@/db"
import { executar } from "@/lib/acoes"
import { obterItemEstoque } from "@/lib/estoque"
import { ajusteSchema } from "@/lib/schemas/producao"
import { zInteiro } from "@/lib/validacao"

export async function ajustarEstoque(entrada: unknown) {
  return executar(async () => {
    const a = ajusteSchema.parse(entrada)
    const itemId = await comUsuario(async (tx) => {
      const id = await obterItemEstoque(tx, a)
      await tx.insert(estoqueMov).values({
        estoqueItemId: id,
        tipo: "ajuste",
        quantidade: a.sentido === "entrada" ? a.quantidade : -a.quantidade,
        motivo: a.motivo,
        observacao: a.observacao,
        permitirNegativo: a.permitirNegativo,
      })
      return id
    })
    revalidatePath("/sistema/estoque")
    revalidatePath(`/sistema/estoque/${itemId}`)
    return { id: itemId }
  })
}

export async function definirEstoqueMinimo(itemId: string, entrada: unknown) {
  return executar(async () => {
    const { minimo } = z.object({ minimo: zInteiro({ min: 0, rotulo: "Mínimo" }) }).parse(entrada)
    await comUsuario((tx) =>
      tx.update(estoqueItens).set({ estoqueMinimoPecas: minimo }).where(eq(estoqueItens.id, itemId))
    )
    revalidatePath("/sistema/estoque")
    revalidatePath(`/sistema/estoque/${itemId}`)
  })
}
