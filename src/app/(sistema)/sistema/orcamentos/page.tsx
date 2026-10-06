import { desc } from "drizzle-orm"

import { CabecalhoPagina } from "@/components/sistema/cabecalho-pagina"
import { comUsuario, orcamentosSite } from "@/db"

import { CaixaOrcamentos } from "./lista"

export const metadata = { title: "Orçamentos do site" }

export default async function OrcamentosPage() {
  const dados = await comUsuario((tx) =>
    tx.select().from(orcamentosSite).orderBy(desc(orcamentosSite.createdAt)).limit(500)
  )
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CabecalhoPagina
        titulo="Orçamentos do site"
        descricao="Pedidos enviados pelo formulário da página inicial. Responda pelo WhatsApp e acompanhe o status."
      />
      <CaixaOrcamentos dados={dados} />
    </div>
  )
}
