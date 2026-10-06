import { AlertTriangle, Boxes, DollarSign } from "lucide-react"

import { CabecalhoPagina } from "@/components/sistema/cabecalho-pagina"
import { CartaoIndicador } from "@/components/sistema/cartao-indicador"
import { asc, eq } from "drizzle-orm"

import { Abas } from "@/components/sistema/abas"
import { comUsuario, produtos } from "@/db"
import { valorTotal } from "@/lib/calculos"
import { listarEstoque, situacaoEstoque } from "@/lib/consultas/estoque"
import { opcoesCadastros } from "@/lib/consultas/opcoes"
import { formatMoeda, formatNumero } from "@/lib/format"

import { ListaEstoque } from "./lista"
import { ListaEstoqueProdutos, type ProdutoEstoque } from "./produtos"

export const metadata = { title: "Estoque" }

export default async function EstoquePage({
  searchParams,
}: {
  searchParams: Promise<{ aba?: string }>
}) {
  const aba = (await searchParams).aba === "produtos" ? "produtos" : "madeira"
  const [itens, opcoes, listaProdutos] = await comUsuario((tx) =>
    Promise.all([
      listarEstoque(tx),
      opcoesCadastros(tx),
      tx
        .select()
        .from(produtos)
        .where(eq(produtos.ativo, true))
        .orderBy(asc(produtos.categoria), asc(produtos.nome)),
    ])
  )
  const produtosEstoque: ProdutoEstoque[] = listaProdutos.map((p) => ({
    id: p.id,
    nome: p.nome,
    categoria: p.categoria,
    dimensoes: p.dimensoes,
    saldoUnidades: p.saldoUnidades,
    precoVenda: p.precoVenda,
    estoqueMinimo: p.estoqueMinimo,
    situacao: situacaoEstoque({ saldoPecas: p.saldoUnidades, estoqueMinimoPecas: p.estoqueMinimo }),
  }))
  const unidades = produtosEstoque.reduce((a, p) => a + Math.max(p.saldoUnidades, 0), 0)
  const valorProdutos = produtosEstoque.reduce(
    (a, p) => a + Math.max(p.saldoUnidades, 0) * Number(p.precoVenda),
    0
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
  const valor = comValor.reduce((a, i) => a + (i.valorEstimado ?? 0), 0) + valorProdutos
  const baixos =
    comValor.filter((i) => i.situacao === "baixo" || i.situacao === "negativo").length +
    produtosEstoque.filter((p) => p.situacao === "baixo" || p.situacao === "negativo").length

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
          detalhe="Madeira e produtos, pelo preço de venda"
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
      <Abas
        atual={aba}
        abas={[
          { valor: "madeira", rotulo: "Madeira serrada", href: "/sistema/estoque" },
          {
            valor: "produtos",
            rotulo: `Paletes e caixotes (${unidades.toLocaleString("pt-BR")} un.)`,
            href: "/sistema/estoque?aba=produtos",
          },
        ]}
      />
      {aba === "produtos" ? (
        <ListaEstoqueProdutos dados={produtosEstoque} />
      ) : (
        <ListaEstoque dados={comValor} especies={opcoes.especies} qualidades={opcoes.qualidades} />
      )}
    </div>
  )
}
