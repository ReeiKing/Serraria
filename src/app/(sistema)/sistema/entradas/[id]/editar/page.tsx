import { notFound } from "next/navigation"

import { CabecalhoPagina } from "@/components/sistema/cabecalho-pagina"
import { comUsuario } from "@/db"
import { opcoesCadastros } from "@/lib/consultas/opcoes"
import { precosVigentes } from "@/lib/precos"

import { valoresEntradaExistente } from "../../dados-formulario"
import { FormularioEntrada } from "../../formulario"

export const metadata = { title: "Editar entrada" }

export default async function EditarEntradaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [opcoes, precos, valores] = await comUsuario((tx) =>
    Promise.all([opcoesCadastros(tx), precosVigentes(tx), valoresEntradaExistente(tx, id)])
  )
  if (!valores) notFound()
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CabecalhoPagina
        titulo="Editar entrada"
        voltar={{ href: `/sistema/entradas/${id}`, rotulo: "Voltar à entrada" }}
      />
      <FormularioEntrada id={id} valoresIniciais={valores} opcoes={opcoes} precos={precos} />
    </div>
  )
}
