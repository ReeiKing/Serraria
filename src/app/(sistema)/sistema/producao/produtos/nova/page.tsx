import { asc, eq } from "drizzle-orm"
import { format } from "date-fns"

import { CabecalhoPagina } from "@/components/sistema/cabecalho-pagina"
import { comUsuario, produtos } from "@/db"
import { agoraSP } from "@/lib/format"

import { FormularioMontagem } from "./formulario"

export const metadata = { title: "Montagem de paletes e caixotes" }

export default async function NovaMontagemPage() {
  const lista = await comUsuario((tx) =>
    tx
      .select({
        id: produtos.id,
        nome: produtos.nome,
        dimensoes: produtos.dimensoes,
        saldo: produtos.saldoUnidades,
      })
      .from(produtos)
      .where(eq(produtos.ativo, true))
      .orderBy(asc(produtos.categoria), asc(produtos.nome))
  )
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <CabecalhoPagina
        titulo="Montagem de paletes e caixotes"
        descricao="Lance quantas unidades foram montadas; elas entram no estoque de produtos."
        voltar={{ href: "/sistema/producao?aba=produtos", rotulo: "Produção" }}
      />
      <FormularioMontagem produtos={lista} hoje={format(agoraSP(), "yyyy-MM-dd")} />
    </div>
  )
}
