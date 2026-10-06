import { notFound } from "next/navigation"

import { BadgeVenda } from "@/components/sistema/badge-venda"
import { CabecalhoPagina } from "@/components/sistema/cabecalho-pagina"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { comUsuario } from "@/db"
import { carregarVenda } from "@/lib/consultas/venda"
import {
  formatBitola,
  formatCep,
  formatDataHora,
  formatDocumento,
  formatM3,
  formatMoeda,
  formatNumero,
  formatPlaca,
} from "@/lib/format"
import { TIPOS_FRETE } from "@/lib/vendas"

import { AcoesVenda, LinhaDoTempo } from "./cliente"

export const metadata = { title: "Venda" }

function Info({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs">{rotulo}</dt>
      <dd className="font-medium">{children || "—"}</dd>
    </div>
  )
}

export default async function VendaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const d = await comUsuario((tx) => carregarVenda(tx, id))
  if (!d) notFound()
  const v = d.venda
  const destino = [
    [v.destinoLogradouro, v.destinoNumero].filter(Boolean).join(", "),
    v.destinoBairro,
    [v.destinoMunicipio, v.destinoUf].filter(Boolean).join("/"),
    v.destinoCep && formatCep(v.destinoCep),
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CabecalhoPagina
        titulo={`Venda nº ${v.numero}`}
        descricao={
          <span className="flex flex-wrap items-center gap-2">
            <BadgeVenda status={v.status} />
            Registrada em {formatDataHora(v.createdAt)}
            {d.criadoPor && ` por ${d.criadoPor}`}
            {d.romaneio && ` · Romaneio nº ${d.romaneio.numero}`}
          </span>
        }
        voltar={{ href: "/sistema/vendas", rotulo: "Vendas" }}
        acoes={<AcoesVenda id={id} status={v.status} temRomaneio={!!d.romaneio} />}
      />

      <LinhaDoTempo
        status={v.status}
        datas={{
          criada: v.createdAt,
          confirmada: v.confirmadaEm,
          entregue: v.entregueEm,
          nfe: d.notaAutorizada?.autorizadaEm ?? null,
        }}
      />

      {v.status === "cancelada" && (
        <Alert variant="destructive">
          <AlertTitle>
            Venda cancelada{v.canceladaEm && ` em ${formatDataHora(v.canceladaEm)}`}
          </AlertTitle>
          <AlertDescription>{v.motivoCancelamento}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-card rounded-2xl border p-5 md:col-span-2">
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Info rotulo="Cliente">{d.cliente.razaoSocial}</Info>
            <Info rotulo="CNPJ/CPF">{formatDocumento(d.cliente.documento)}</Info>
            <Info rotulo="IE">{d.cliente.ie}</Info>
            <div className="col-span-full">
              <Info rotulo="Destino da carga">{destino}</Info>
            </div>
            <Info rotulo="Motorista">{d.motorista?.nome}</Info>
            <Info rotulo="Placa">{formatPlaca(v.placa)}</Info>
            <Info rotulo="Frete">{TIPOS_FRETE.find((f) => f.valor === v.tipoFrete)?.rotulo}</Info>
            {v.documentoFlorestal && (
              <Info rotulo="Documento florestal">{v.documentoFlorestal}</Info>
            )}
          </dl>
          {v.observacoes && (
            <p className="bg-muted/50 mt-4 rounded-lg p-3 text-sm">{v.observacoes}</p>
          )}
        </div>
        <div className="from-primary text-primary-foreground flex flex-col gap-2 rounded-2xl bg-gradient-to-br to-[#5a2f12] p-5">
          <span className="text-primary-foreground/70 text-sm">Carga</span>
          <span className="font-heading text-3xl font-semibold tabular-nums">
            {formatNumero(v.totalM3, 3, 6)} m³
          </span>
          <span className="text-primary-foreground/80 text-sm">
            {v.totalPecas.toLocaleString("pt-BR")} peças
          </span>
          <div className="my-1 h-px bg-white/20" />
          <dl className="grid grid-cols-2 gap-1 text-sm tabular-nums">
            <dt className="text-primary-foreground/70">Produtos</dt>
            <dd className="text-right">{formatMoeda(v.valorProdutos)}</dd>
            <dt className="text-primary-foreground/70">Frete</dt>
            <dd className="text-right">{formatMoeda(v.valorFrete)}</dd>
            <dt className="text-primary-foreground/70">Desconto</dt>
            <dd className="text-right">− {formatMoeda(v.desconto)}</dd>
          </dl>
          <span className="font-heading text-3xl font-semibold tabular-nums">
            {formatMoeda(v.valorTotal)}
          </span>
        </div>
      </div>

      <section className="bg-card overflow-x-auto rounded-2xl border p-5">
        <h2 className="font-heading mb-3 text-lg font-semibold">Itens</h2>
        <table className="w-full text-sm">
          <thead className="text-muted-foreground text-left">
            <tr>
              <th className="py-2 font-medium">Espécie</th>
              <th className="font-medium">Bitola</th>
              <th className="font-medium">Qualidade</th>
              <th className="text-right font-medium">Peças</th>
              <th className="text-right font-medium">m³</th>
              <th className="text-right font-medium">R$/m³</th>
              <th className="text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {d.itens.map((i) =>
              i.unidade === "UN" ? (
                <tr key={i.id} className="border-t">
                  <td className="py-2" colSpan={3}>
                    <span className="font-medium">{i.produto}</span>
                    {i.dimensoes && <span className="text-muted-foreground"> · {i.dimensoes}</span>}
                  </td>
                  <td className="text-right">{i.quantidade.toLocaleString("pt-BR")} un.</td>
                  <td className="text-muted-foreground text-right">—</td>
                  <td className="text-right">{formatMoeda(i.precoUnitario)}/un.</td>
                  <td className="text-right font-medium">{formatMoeda(i.valorTotal)}</td>
                </tr>
              ) : (
                <tr key={i.id} className="border-t">
                  <td className="py-2">{i.especie}</td>
                  <td>
                    <a
                      href={`/sistema/estoque/${i.estoqueItemId}`}
                      className="text-primary hover:underline"
                    >
                      {formatBitola(i.espessuraCm ?? 0, i.larguraCm ?? 0, i.comprimentoM ?? 0)}
                    </a>
                  </td>
                  <td>{i.qualidade}</td>
                  <td className="text-right">{i.quantidade.toLocaleString("pt-BR")}</td>
                  <td className="text-right">{formatM3(i.volumeM3)}</td>
                  <td className="text-right">{formatMoeda(i.precoM3)}</td>
                  <td className="text-right font-medium">{formatMoeda(i.valorTotal)}</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </section>
    </div>
  )
}
