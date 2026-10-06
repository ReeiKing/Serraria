import { desc, eq } from "drizzle-orm"
import { notFound } from "next/navigation"

import { CabecalhoPagina } from "@/components/sistema/cabecalho-pagina"
import { comUsuario, estoqueMov, producoes, usuarios, vendas } from "@/db"
import { listarEstoque, situacaoEstoque } from "@/lib/consultas/estoque"
import { opcoesCadastros } from "@/lib/consultas/opcoes"
import { formatBitola, formatM3, formatMoeda, formatNumero } from "@/lib/format"
import { valorTotal } from "@/lib/calculos"

import { BadgeSituacao } from "../lista"
import { AcoesItem, Kardex } from "./cliente"

export const metadata = { title: "Kardex" }

export default async function ItemEstoquePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const dados = await comUsuario(async (tx) => {
    const itens = await listarEstoque(tx)
    const item = itens.find((i) => i.id === id)
    if (!item) return null
    const [movs, opcoes] = await Promise.all([
      tx
        .select({
          id: estoqueMov.id,
          createdAt: estoqueMov.createdAt,
          tipo: estoqueMov.tipo,
          quantidade: estoqueMov.quantidade,
          saldoApos: estoqueMov.saldoApos,
          motivo: estoqueMov.motivo,
          observacao: estoqueMov.observacao,
          usuario: usuarios.nome,
          producaoId: estoqueMov.producaoId,
          producaoNumero: producoes.numero,
          vendaId: estoqueMov.vendaId,
          vendaNumero: vendas.numero,
        })
        .from(estoqueMov)
        .leftJoin(usuarios, eq(usuarios.id, estoqueMov.createdBy))
        .leftJoin(producoes, eq(producoes.id, estoqueMov.producaoId))
        .leftJoin(vendas, eq(vendas.id, estoqueMov.vendaId))
        .where(eq(estoqueMov.estoqueItemId, id))
        .orderBy(desc(estoqueMov.createdAt)),
      opcoesCadastros(tx),
    ])
    return { item, movs, opcoes }
  })
  if (!dados) notFound()
  const { item } = dados
  const bitola = formatBitola(item.espessuraCm, item.larguraCm, item.comprimentoM)

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <CabecalhoPagina
        titulo={`${item.especie} ${bitola}`}
        descricao={`${item.qualidade} · ${formatM3(item.volumePecaM3)} m³ por peça`}
        voltar={{ href: "/sistema/estoque", rotulo: "Estoque" }}
        acoes={
          <AcoesItem
            item={item}
            especies={dados.opcoes.especies}
            qualidades={dados.opcoes.qualidades}
          />
        }
      />
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="bg-card rounded-2xl border p-5">
          <div className="text-muted-foreground text-sm">Saldo</div>
          <div className="font-heading text-3xl font-semibold tabular-nums">
            {item.saldoPecas.toLocaleString("pt-BR")}
          </div>
          <div className="text-muted-foreground text-sm">peças</div>
        </div>
        <div className="bg-card rounded-2xl border p-5">
          <div className="text-muted-foreground text-sm">Volume</div>
          <div className="font-heading text-3xl font-semibold tabular-nums">
            {formatNumero(item.saldoM3, 3, 6)}
          </div>
          <div className="text-muted-foreground text-sm">m³</div>
        </div>
        <div className="bg-card rounded-2xl border p-5">
          <div className="text-muted-foreground text-sm">Valor estimado</div>
          <div className="font-heading text-2xl font-semibold tabular-nums">
            {item.precoM3 && item.saldoPecas > 0
              ? formatMoeda(valorTotal(item.saldoM3 ?? 0, item.precoM3))
              : "—"}
          </div>
          <div className="text-muted-foreground text-sm">
            {item.precoM3 ? `${formatMoeda(item.precoM3)}/m³` : "sem preço na tabela"}
          </div>
        </div>
        <div className="bg-card flex flex-col gap-2 rounded-2xl border p-5">
          <div className="text-muted-foreground text-sm">Situação</div>
          <BadgeSituacao situacao={situacaoEstoque(item)} />
          <div className="text-muted-foreground text-sm">
            mínimo: {item.estoqueMinimoPecas.toLocaleString("pt-BR")} peças
          </div>
        </div>
      </div>
      <Kardex movs={dados.movs} />
    </div>
  )
}
