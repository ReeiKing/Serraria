import { asc, eq } from "drizzle-orm"

import { CabecalhoPagina } from "@/components/sistema/cabecalho-pagina"
import { comUsuario, especies, produtos } from "@/db"

import { ListaProdutos } from "./lista"

export const metadata = { title: "Paletes e caixotes" }

export default async function ProdutosPage() {
  const [dados, listaEspecies] = await comUsuario((tx) =>
    Promise.all([
      tx.select().from(produtos).orderBy(asc(produtos.categoria), asc(produtos.nome)),
      tx
        .select({ id: especies.id, nome: especies.nome })
        .from(especies)
        .where(eq(especies.ativo, true))
        .orderBy(asc(especies.nome)),
    ])
  )
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CabecalhoPagina
        titulo="Paletes e caixotes"
        descricao="Produtos vendidos por unidade. O estoque é controlado em Estoque → Paletes e caixotes."
        voltar={{ href: "/sistema/cadastros", rotulo: "Cadastros" }}
      />
      <ListaProdutos dados={dados} especies={listaEspecies} />
    </div>
  )
}
