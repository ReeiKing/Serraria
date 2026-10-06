import { notFound, redirect } from "next/navigation"

import { CabecalhoPagina } from "@/components/sistema/cabecalho-pagina"
import { comUsuario } from "@/db"

import { dadosFormularioVenda, valoresVendaExistente } from "../../dados"
import { FormularioVenda } from "../../formulario"

export const metadata = { title: "Editar venda" }

export default async function EditarVendaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [dados, venda] = await comUsuario((tx) =>
    Promise.all([dadosFormularioVenda(tx), valoresVendaExistente(tx, id)])
  )
  if (!venda) notFound()
  if (venda.status !== "rascunho") redirect(`/sistema/vendas/${id}`)
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CabecalhoPagina
        titulo="Editar rascunho"
        voltar={{ href: `/sistema/vendas/${id}`, rotulo: "Voltar à venda" }}
      />
      <FormularioVenda id={id} valoresIniciais={venda.valores} {...dados} />
    </div>
  )
}
