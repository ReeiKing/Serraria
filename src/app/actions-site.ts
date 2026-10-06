"use server"

import { headers } from "next/headers"
import { z } from "zod"

import { dbSistema, orcamentosSite } from "@/db"
import { executar } from "@/lib/acoes"
import { dentroDoLimite } from "@/lib/limite"
import { zEmailOpcional, zTelefoneOpcional, zTextoOpcional } from "@/lib/validacao"

const orcamentoSchemaServidor = z.object({
  nome: z.string().trim().min(2, "Informe seu nome").max(120),
  telefone: zTelefoneOpcional.refine((v) => v !== null, "Informe um telefone para contato"),
  email: zEmailOpcional,
  cidade: zTextoOpcional,
  produto: zTextoOpcional,
  mensagem: z
    .string()
    .trim()
    .max(2000)
    .transform((v) => (v === "" ? null : v)),
  // armadilha para robôs: humanos não veem este campo
  site: z.string().max(0).optional(),
})

/** Formulário de orçamento do site público (visitante sem login). */
export async function enviarOrcamento(entrada: unknown) {
  return executar(async () => {
    const h = await headers()
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local"
    if (!dentroDoLimite(`orcamento:${ip}`, 5, 10 * 60_000)) {
      throw new Error("Muitos pedidos em sequência. Aguarde alguns minutos ou chame no WhatsApp.")
    }
    const { site: _robo, ...dados } = orcamentoSchemaServidor.parse(entrada)
    void _robo
    await dbSistema.insert(orcamentosSite).values({ ...dados, telefone: dados.telefone! })
  })
}
