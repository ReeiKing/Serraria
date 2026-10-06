import { eq } from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"
import { notFound } from "next/navigation"

import { CabecalhoPagina } from "@/components/sistema/cabecalho-pagina"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { comUsuario, producoesProdutos, producoesProdutosItens, produtos, usuarios } from "@/db"
import { formatData, formatDataHora, formatMoeda } from "@/lib/format"

import { BotaoEstornoMontagem } from "./estorno"

export const metadata = { title: "Montagem" }

export default async function MontagemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const criador = alias(usuarios, "criador")
  const dados = await comUsuario(async (tx) => {
    const [p] = await tx
      .select({ p: producoesProdutos, criadoPor: criador.nome })
      .from(producoesProdutos)
      .leftJoin(criador, eq(criador.id, producoesProdutos.createdBy))
      .where(eq(producoesProdutos.id, id))
    if (!p) return null
    const itens = await tx
      .select({
        id: producoesProdutosItens.id,
        produtoId: produtos.id,
        nome: produtos.nome,
        dimensoes: produtos.dimensoes,
        preco: produtos.precoVenda,
        quantidade: producoesProdutosItens.quantidade,
      })
      .from(producoesProdutosItens)
      .innerJoin(produtos, eq(produtos.id, producoesProdutosItens.produtoId))
      .where(eq(producoesProdutosItens.producaoId, id))
    return { ...p, itens }
  })
  if (!dados) notFound()
  const p = dados.p
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <CabecalhoPagina
        titulo={`Montagem nº ${p.numero}`}
        descricao={`${formatData(`${p.dataProducao}T12:00:00`)} · registrada em ${formatDataHora(p.createdAt)}${dados.criadoPor ? ` por ${dados.criadoPor}` : ""}`}
        voltar={{ href: "/sistema/producao?aba=produtos", rotulo: "Produção" }}
        acoes={!p.estornadaEm && <BotaoEstornoMontagem id={id} />}
      />
      {p.estornadaEm && (
        <Alert variant="destructive">
          <AlertTitle>Montagem estornada em {formatDataHora(p.estornadaEm)}</AlertTitle>
          <AlertDescription>{p.motivoEstorno}</AlertDescription>
        </Alert>
      )}
      <section className="bg-card rounded-2xl border p-5">
        <table className="w-full text-sm">
          <thead className="text-muted-foreground text-left">
            <tr>
              <th className="py-2 font-medium">Produto</th>
              <th className="text-right font-medium">Unidades</th>
              <th className="text-right font-medium">Valor estimado</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {dados.itens.map((i) => (
              <tr key={i.id} className="border-t">
                <td className="py-2">
                  <a
                    href={`/sistema/estoque/produto/${i.produtoId}`}
                    className="text-primary font-medium hover:underline"
                  >
                    {i.nome}
                  </a>
                  {i.dimensoes && <span className="text-muted-foreground"> · {i.dimensoes}</span>}
                </td>
                <td className="text-right">{i.quantidade.toLocaleString("pt-BR")}</td>
                <td className="text-right">{formatMoeda(i.quantidade * Number(i.preco))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {p.observacoes && (
          <p className="bg-muted/50 mt-4 rounded-lg p-3 text-sm">{p.observacoes}</p>
        )}
      </section>
    </div>
  )
}
