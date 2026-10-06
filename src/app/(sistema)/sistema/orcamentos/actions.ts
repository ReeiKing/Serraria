"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { comUsuario, orcamentosSite } from "@/db"
import { executar } from "@/lib/acoes"

const statusSchema = z.enum(["novo", "em_atendimento", "concluido", "descartado"])

export async function mudarStatusOrcamento(id: string, status: unknown) {
  return executar(async () => {
    const s = statusSchema.parse(status)
    await comUsuario((tx) =>
      tx.update(orcamentosSite).set({ status: s }).where(eq(orcamentosSite.id, id))
    )
    revalidatePath("/sistema/orcamentos")
    revalidatePath("/sistema")
  })
}
