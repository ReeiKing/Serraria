import { asc } from "drizzle-orm"

import { CabecalhoPagina } from "@/components/sistema/cabecalho-pagina"
import { comUsuario, fornecedores } from "@/db"

import { ListaFornecedores } from "./lista"

export const metadata = { title: "Fornecedores" }

export default async function FornecedoresPage() {
  const dados = await comUsuario((tx) =>
    tx.select().from(fornecedores).orderBy(asc(fornecedores.nome))
  )
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CabecalhoPagina
        titulo="Fornecedores"
        descricao="Quem vende as toras."
        voltar={{ href: "/sistema/cadastros", rotulo: "Cadastros" }}
      />
      <ListaFornecedores dados={dados} />
    </div>
  )
}
