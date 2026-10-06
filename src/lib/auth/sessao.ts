import "server-only"

import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import { cache } from "react"

import { comUsuario, usuarios } from "@/db"
import { createClient } from "@/lib/supabase/server"

import type { Papel } from "./papeis"

export type UsuarioLogado = {
  id: string
  nome: string
  email: string
  papel: Papel
}

/** Usuário logado e ativo (uma consulta por requisição), ou null. */
export const obterUsuario = cache(async (): Promise<UsuarioLogado | null> => {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const id = data?.claims?.sub
  if (!id) return null

  const [perfil] = await comUsuario((tx) =>
    tx
      .select({
        id: usuarios.id,
        nome: usuarios.nome,
        email: usuarios.email,
        papel: usuarios.papel,
        ativo: usuarios.ativo,
      })
      .from(usuarios)
      .where(eq(usuarios.id, id))
  )
  if (!perfil?.ativo) return null
  return { id: perfil.id, nome: perfil.nome, email: perfil.email, papel: perfil.papel }
})

/** Exige login (e opcionalmente um dos papéis); redireciona caso contrário. */
export async function exigirUsuario(...papeis: Papel[]): Promise<UsuarioLogado> {
  const usuario = await obterUsuario()
  if (!usuario) redirect("/login")
  if (papeis.length && !papeis.includes(usuario.papel)) redirect("/sistema?sem-permissao=1")
  return usuario
}
