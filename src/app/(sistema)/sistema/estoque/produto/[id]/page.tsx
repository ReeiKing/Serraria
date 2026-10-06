import { desc, eq } from "drizzle-orm"
import { notFound } from "next/navigation"

import { CabecalhoPagina } from "@/components/sistema/cabecalho-pagina"
import { comUsuario, producoesProdutos, produtos, produtosMov, usuarios, vendas } from "@/db"
import { situacaoEstoque } from "@/lib/consultas/estoque"
import { formatMoeda } from "@/lib/format"

import { BadgeSituacao } from "../../lista"
import { AcoesProduto, KardexProduto } from "./cliente"

export const metadata = { title: "Kardex do produto" }

export default async function ProdutoEstoquePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const dados = await comUsuario(async (tx) => {
    const [p] = await tx.select().from(produtos).where(eq(produtos.id, id))
    if (!p) return null
    const movs = await tx
      .select({
        id: produtosMov.id,
        createdAt: produtosMov.createdAt,
        tipo: produtosMov.tipo,
        quantidade: produtosMov.quantidade,
        saldoApos: produtosMov.saldoApos,
        motivo: produtosMov.motivo,
        observacao: produtosMov.observacao,
        usuario: usuarios.nome,
        producaoId: produtosMov.producaoId,
        producaoNumero: producoesProdutos.numero,
        vendaId: produtosMov.vendaId,
        vendaNumero: vendas.numero,
      })
      .from(produtosMov)
      .leftJoin(usuarios, eq(usuarios.id, produtosMov.createdBy))
      .leftJoin(producoesProdutos, eq(producoesProdutos.id, produtosMov.producaoId))
      .leftJoin(vendas, eq(vendas.id, produtosMov.vendaId))
      .where(eq(produtosMov.produtoId, id))
      .orderBy(desc(produtosMov.createdAt))
    return { p, movs }
  })
  if (!dados) notFound()
  const { p } = dados
  const situacao = situacaoEstoque({
    saldoPecas: p.saldoUnidades,
    estoqueMinimoPecas: p.estoqueMinimo,
  })

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <CabecalhoPagina
        titulo={p.nome}
        descricao={[p.dimensoes, `${formatMoeda(p.precoVenda)} por unidade`]
          .filter(Boolean)
          .join(" · ")}
        voltar={{ href: "/sistema/estoque?aba=produtos", rotulo: "Paletes e caixotes" }}
        acoes={<AcoesProduto id={p.id} nome={p.nome} minimo={p.estoqueMinimo} />}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-card rounded-2xl border p-5">
          <div className="text-muted-foreground text-sm">Em estoque</div>
          <div className="font-heading text-3xl font-semibold tabular-nums">
            {p.saldoUnidades.toLocaleString("pt-BR")}
          </div>
          <div className="text-muted-foreground text-sm">unidades</div>
        </div>
        <div className="bg-card rounded-2xl border p-5">
          <div className="text-muted-foreground text-sm">Valor estimado</div>
          <div className="font-heading text-2xl font-semibold tabular-nums">
            {formatMoeda(Math.max(p.saldoUnidades, 0) * Number(p.precoVenda))}
          </div>
        </div>
        <div className="bg-card flex flex-col gap-2 rounded-2xl border p-5">
          <div className="text-muted-foreground text-sm">Situação</div>
          <BadgeSituacao situacao={situacao} />
          <div className="text-muted-foreground text-sm">
            mínimo: {p.estoqueMinimo.toLocaleString("pt-BR")} un.
          </div>
        </div>
      </div>
      <KardexProduto movs={dados.movs} />
    </div>
  )
}
