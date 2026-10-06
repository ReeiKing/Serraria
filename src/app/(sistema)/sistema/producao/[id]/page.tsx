import { eq } from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"
import { notFound } from "next/navigation"

import { CabecalhoPagina } from "@/components/sistema/cabecalho-pagina"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  comUsuario,
  especies,
  estoqueItens,
  producoes,
  producoesItens,
  qualidades,
  usuarios,
} from "@/db"
import {
  formatBitola,
  formatData,
  formatDataHora,
  formatM3,
  formatNumero,
  formatPercentual,
} from "@/lib/format"
import { corRendimento } from "@/lib/producao"
import { cn } from "@/lib/utils"

import { BotaoEstorno } from "./estorno"

export const metadata = { title: "Produção" }

export default async function ProducaoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const criador = alias(usuarios, "criador")
  const dados = await comUsuario(async (tx) => {
    const [p] = await tx
      .select({ p: producoes, especie: especies.nome, criadoPor: criador.nome })
      .from(producoes)
      .innerJoin(especies, eq(especies.id, producoes.especieId))
      .leftJoin(criador, eq(criador.id, producoes.createdBy))
      .where(eq(producoes.id, id))
    if (!p) return null
    const itens = await tx
      .select({
        id: producoesItens.id,
        estoqueItemId: producoesItens.estoqueItemId,
        quantidade: producoesItens.quantidade,
        volumePecaM3: producoesItens.volumePecaM3,
        volumeTotalM3: producoesItens.volumeTotalM3,
        espessuraCm: estoqueItens.espessuraCm,
        larguraCm: estoqueItens.larguraCm,
        comprimentoM: estoqueItens.comprimentoM,
        qualidade: qualidades.nome,
      })
      .from(producoesItens)
      .innerJoin(estoqueItens, eq(estoqueItens.id, producoesItens.estoqueItemId))
      .innerJoin(qualidades, eq(qualidades.id, estoqueItens.qualidadeId))
      .where(eq(producoesItens.producaoId, id))
    return { ...p, itens }
  })
  if (!dados) notFound()
  const p = dados.p
  const rend = p.rendimentoPercentual === null ? null : Number(p.rendimentoPercentual)

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <CabecalhoPagina
        titulo={`Produção nº ${p.numero}`}
        descricao={`${dados.especie} · ${formatData(`${p.dataProducao}T12:00:00`)} · registrada em ${formatDataHora(p.createdAt)}${dados.criadoPor ? ` por ${dados.criadoPor}` : ""}`}
        voltar={{ href: "/sistema/producao", rotulo: "Produção" }}
        acoes={!p.estornadaEm && <BotaoEstorno id={id} />}
      />

      {p.estornadaEm && (
        <Alert variant="destructive">
          <AlertTitle>Produção estornada em {formatDataHora(p.estornadaEm)}</AlertTitle>
          <AlertDescription>
            {p.motivoEstorno}. As peças saíram do estoque e as toras voltaram.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-card rounded-2xl border p-5">
          <div className="text-muted-foreground text-sm">Toras consumidas</div>
          <div className="font-heading text-3xl font-semibold tabular-nums">
            {p.torasConsumidasM3 ? `${formatNumero(p.torasConsumidasM3, 3)} m³` : "—"}
          </div>
        </div>
        <div className="bg-card rounded-2xl border p-5">
          <div className="text-muted-foreground text-sm">Madeira serrada</div>
          <div className="font-heading text-3xl font-semibold tabular-nums">
            {formatNumero(p.volumeSerradoM3, 3, 6)} m³
          </div>
          <div className="text-muted-foreground text-sm">
            {p.totalPecas.toLocaleString("pt-BR")} peças
          </div>
        </div>
        <div className="bg-card rounded-2xl border p-5">
          <div className="text-muted-foreground text-sm">Rendimento</div>
          <div
            className={cn("font-heading text-3xl font-semibold tabular-nums", corRendimento(rend))}
          >
            {rend === null ? "—" : formatPercentual(rend)}
          </div>
        </div>
      </div>

      <section className="bg-card overflow-x-auto rounded-2xl border p-5">
        <h2 className="font-heading mb-3 text-lg font-semibold">Peças</h2>
        <table className="w-full text-sm">
          <thead className="text-muted-foreground text-left">
            <tr>
              <th className="py-2 font-medium">Bitola (cm × cm × m)</th>
              <th className="font-medium">Qualidade</th>
              <th className="text-right font-medium">Peças</th>
              <th className="text-right font-medium">m³/peça</th>
              <th className="text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {dados.itens.map((i) => (
              <tr key={i.id} className="border-t">
                <td className="py-2">
                  <a
                    href={`/sistema/estoque/${i.estoqueItemId}`}
                    className="text-primary font-medium hover:underline"
                  >
                    {formatBitola(i.espessuraCm, i.larguraCm, i.comprimentoM)}
                  </a>
                </td>
                <td>{i.qualidade}</td>
                <td className="text-right">{i.quantidade.toLocaleString("pt-BR")}</td>
                <td className="text-right">{formatM3(i.volumePecaM3)}</td>
                <td className="text-right font-medium">{formatM3(i.volumeTotalM3)} m³</td>
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
