import "server-only"

import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import { cache } from "react"

import { comUsuario, usuarios } from "@/db"
import { createClient } from "@/lib/supabase/server"

export type UsuarioLogado = {
  id: string
  nome: string
  email: string
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
        ativo: usuarios.ativo,
      })
      .from(usuarios)
      .where(eq(usuarios.id, id))
  )
  if (!perfil?.ativo) return null
  return { id: perfil.id, nome: perfil.nome, email: perfil.email }
})

/** Exige login; sem sessão válida, redireciona para /login. */
export async function exigirUsuario(): Promise<UsuarioLogado> {
  const usuario = await obterUsuario()
  if (!usuario) redirect("/login")
  return usuario
}
