"use server"

import { redirect } from "next/navigation"
import { z } from "zod"

import { createClient } from "@/lib/supabase/server"

const loginSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido"),
  senha: z.string().min(6, "A senha tem pelo menos 6 caracteres"),
  proximo: z.string().optional(),
})

export type LoginEstado = { erro?: string }

export async function entrar(_: LoginEstado, formData: FormData): Promise<LoginEstado> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos" }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.senha,
  })
  if (error) return { erro: "E-mail ou senha incorretos." }

  // Só redireciona para dentro do sistema (evita open redirect).
  const proximo = parsed.data.proximo
  redirect(proximo?.startsWith("/sistema") ? proximo : "/sistema")
}

export async function sair() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
