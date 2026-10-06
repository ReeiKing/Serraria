import { CabecalhoPagina } from "@/components/sistema/cabecalho-pagina"
import { comUsuario } from "@/db"

import { VENDA_VAZIA, dadosFormularioVenda } from "../dados"
import { FormularioVenda } from "../formulario"

export const metadata = { title: "Nova venda" }

export default async function NovaVendaPage() {
  const dados = await comUsuario((tx) => dadosFormularioVenda(tx))
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CabecalhoPagina
        titulo="Nova venda / carga de saída"
        voltar={{ href: "/sistema/vendas", rotulo: "Vendas" }}
      />
      <FormularioVenda id={null} valoresIniciais={VENDA_VAZIA} {...dados} />
    </div>
  )
}
