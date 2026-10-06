import { asc } from "drizzle-orm"

import { CabecalhoPagina } from "@/components/sistema/cabecalho-pagina"
import { comUsuario, usuarios } from "@/db"
import { exigirUsuario } from "@/lib/auth/sessao"

import { ListaUsuarios } from "./lista"

export const metadata = { title: "Usuários" }

export default async function UsuariosPage() {
  const eu = await exigirUsuario()
  const dados = await comUsuario((tx) =>
    tx
      .select({
        id: usuarios.id,
        nome: usuarios.nome,
        email: usuarios.email,
        ativo: usuarios.ativo,
        createdAt: usuarios.createdAt,
      })
      .from(usuarios)
      .orderBy(asc(usuarios.nome))
  )
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <CabecalhoPagina
        titulo="Usuários"
        descricao="Todos os usuários têm acesso completo ao sistema. Desative quem não deve mais entrar."
        voltar={{ href: "/sistema/cadastros", rotulo: "Cadastros" }}
      />
      <ListaUsuarios dados={dados} meuId={eu.id} />
    </div>
  )
}
