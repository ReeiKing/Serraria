import { AlertTriangle, Boxes, DollarSign } from "lucide-react"

import { CabecalhoPagina } from "@/components/sistema/cabecalho-pagina"
import { CartaoIndicador } from "@/components/sistema/cartao-indicador"
import { comUsuario } from "@/db"
import { valorTotal } from "@/lib/calculos"
import { listarEstoque, situacaoEstoque } from "@/lib/consultas/estoque"
import { opcoesCadastros } from "@/lib/consultas/opcoes"
import { formatMoeda, formatNumero } from "@/lib/format"

import { ListaEstoque } from "./lista"

export const metadata = { title: "Estoque" }

export default async function EstoquePage() {
  const [itens, opcoes] = await comUsuario((tx) =>
    Promise.all([listarEstoque(tx), opcoesCadastros(tx)])
  )
  const comValor = itens.map((i) => ({
    ...i,
    valorEstimado: i.precoM3 && i.saldoPecas > 0 ? valorTotal(i.saldoM3 ?? 0, i.precoM3) : null,
    situacao: situacaoEstoque(i),
  }))
  const porEspecie = new Map<string, number>()
  for (const i of comValor)
    if (i.saldoPecas > 0)
      porEspecie.set(i.especie, (porEspecie.get(i.especie) ?? 0) + Number(i.saldoM3))
  const valor = comValor.reduce((a, i) => a + (i.valorEstimado ?? 0), 0)
  const baixos = comValor.filter((i) => i.situacao === "baixo" || i.situacao === "negativo").length

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <CabecalhoPagina
        titulo="Estoque"
        descricao="Madeira serrada por espécie, bitola e qualidade. Atualizado por produção, vendas e ajustes."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <CartaoIndicador
          titulo="Em estoque"
          icone={<Boxes />}
          valor={
            porEspecie.size ? (
              <span className="flex flex-col text-xl md:text-2xl">
                {[...porEspecie].map(([e, m3]) => (
                  <span key={e}>
                    {e}: {formatNumero(m3, 2, 3)} m³
                  </span>
                ))}
              </span>
            ) : (
              "—"
            )
          }
        />
        <CartaoIndicador
          destaque
          titulo="Valor estimado"
          icone={<DollarSign />}
          valor={formatMoeda(valor)}
          detalhe="Pelo preço de venda vigente"
          atraso={0.05}
        />
        <CartaoIndicador
          titulo="Estoque baixo"
          icone={<AlertTriangle />}
          valor={baixos}
          detalhe={baixos ? "itens no mínimo ou negativos" : "Nenhum item abaixo do mínimo"}
          atraso={0.1}
        />
      </div>
      <ListaEstoque dados={comValor} especies={opcoes.especies} qualidades={opcoes.qualidades} />
    </div>
  )
}
