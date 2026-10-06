import { CabecalhoPagina } from "@/components/sistema/cabecalho-pagina"
import { comUsuario } from "@/db"
import { opcoesCadastros } from "@/lib/consultas/opcoes"
import { precosVigentes } from "@/lib/precos"

import { valoresNovaEntrada } from "../dados-formulario"
import { FormularioEntrada } from "../formulario"

export const metadata = { title: "Nova entrada" }

export default async function NovaEntradaPage() {
  const [opcoes, precos] = await comUsuario((tx) =>
    Promise.all([opcoesCadastros(tx), precosVigentes(tx)])
  )
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CabecalhoPagina
        titulo="Nova entrada de toras"
        voltar={{ href: "/sistema/entradas", rotulo: "Entradas" }}
      />
      <FormularioEntrada
        id={null}
        valoresIniciais={valoresNovaEntrada(opcoes.especies[0]?.id ?? "")}
        opcoes={opcoes}
        precos={precos}
      />
    </div>
  )
}
