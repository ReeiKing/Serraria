"use server"

import { z } from "zod"

import { dbSistema, orcamentosSite } from "@/db"
import { executar } from "@/lib/acoes"
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
    const { site: _robo, ...dados } = orcamentoSchemaServidor.parse(entrada)
    void _robo
    await dbSistema.insert(orcamentosSite).values({ ...dados, telefone: dados.telefone! })
  })
}
