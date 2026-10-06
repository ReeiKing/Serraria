import { asc } from "drizzle-orm"

import { CabecalhoPagina } from "@/components/sistema/cabecalho-pagina"
import { clientes, comUsuario } from "@/db"

import { ListaClientes } from "./lista"

export const metadata = { title: "Clientes" }

export default async function ClientesPage() {
  const dados = await comUsuario((tx) =>
    tx.select().from(clientes).orderBy(asc(clientes.razaoSocial))
  )
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CabecalhoPagina
        titulo="Clientes"
        descricao="Digite o CNPJ e clique na lupa para preencher os dados automaticamente."
        voltar={{ href: "/sistema/cadastros", rotulo: "Cadastros" }}
      />
      <ListaClientes dados={dados} />
    </div>
  )
}
