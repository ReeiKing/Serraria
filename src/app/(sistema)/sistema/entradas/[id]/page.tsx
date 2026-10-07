import { asc, desc, eq } from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"
import { Pencil } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

import { BadgePagamento } from "@/components/sistema/badges"
import { CabecalhoPagina } from "@/components/sistema/cabecalho-pagina"
import { Button } from "@/components/ui/button"
import {
  comUsuario,
  entradasToras,
  entradasTorasItens,
  entradasTorasPagamentos,
  especies,
  fornecedores,
  motoristas,
  usuarios,
} from "@/db"
import { formatDataHora, formatM3, formatMoeda, formatNumero, formatPlaca } from "@/lib/format"
import { MODOS_MEDICAO, SIGLA_UNIDADE } from "@/lib/schemas/entradas"
import { cn } from "@/lib/utils"

import { AcoesEntrada, Pagamentos } from "./cliente"

export const metadata = { title: "Entrada de toras" }

function Info({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs">{rotulo}</dt>
      <dd className="font-medium">{children || "—"}</dd>
    </div>
  )
}

export default async function EntradaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const criador = alias(usuarios, "criador")
  const editor = alias(usuarios, "editor")

  const dados = await comUsuario(async (tx) => {
    const [e] = await tx
      .select({
        entrada: entradasToras,
        especie: especies.nome,
        fornecedor: fornecedores.nome,
        motorista: motoristas.nome,
        criadoPor: criador.nome,
        alteradoPor: editor.nome,
      })
      .from(entradasToras)
      .innerJoin(especies, eq(especies.id, entradasToras.especieId))
      .innerJoin(fornecedores, eq(fornecedores.id, entradasToras.fornecedorId))
      .leftJoin(motoristas, eq(motoristas.id, entradasToras.motoristaId))
      .leftJoin(criador, eq(criador.id, entradasToras.createdBy))
      .leftJoin(editor, eq(editor.id, entradasToras.updatedBy))
      .where(eq(entradasToras.id, id))
    if (!e) return null
    const [toras, pagamentos] = await Promise.all([
      tx
        .select()
        .from(entradasTorasItens)
        .where(eq(entradasTorasItens.entradaId, id))
        .orderBy(asc(entradasTorasItens.createdAt)),
      tx
        .select()
        .from(entradasTorasPagamentos)
        .where(eq(entradasTorasPagamentos.entradaId, id))
        .orderBy(desc(entradasTorasPagamentos.dataPagamento)),
    ])
    return { ...e, toras, pagamentos }
  })
  if (!dados) notFound()

  const e = dados.entrada
  const sigla = SIGLA_UNIDADE[e.unidade]
  const modo = MODOS_MEDICAO.find((m) => m.valor === e.modoMedicao)
  const restante = Number(e.valorTotal) - Number(e.valorPago)

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <CabecalhoPagina
        titulo={`Entrada nº ${e.numero}`}
        descricao={
          <>
            Registrada em {formatDataHora(e.createdAt)}
            {dados.criadoPor && ` por ${dados.criadoPor}`}
            {e.updatedAt !== e.createdAt &&
              dados.alteradoPor &&
              ` · alterada em ${formatDataHora(e.updatedAt)} por ${dados.alteradoPor}`}
          </>
        }
        voltar={{ href: "/sistema/entradas", rotulo: "Entradas" }}
        acoes={
          <>
            <Button asChild variant="outline" size="lg">
              <Link href={`/sistema/entradas/${id}/editar`}>
                <Pencil /> Editar
              </Link>
            </Button>
            <AcoesEntrada id={id} />
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-card rounded-2xl border p-5 md:col-span-2">
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Info rotulo="Espécie">{dados.especie}</Info>
            <Info rotulo="Fornecedor">{dados.fornecedor}</Info>
            <Info rotulo="Placa">{formatPlaca(e.placa)}</Info>
            <Info rotulo="Motorista">{dados.motorista}</Info>
            <Info rotulo="Origem">
              {[e.origem, [e.municipioOrigem, e.ufOrigem].filter(Boolean).join("/")]
                .filter(Boolean)
                .join(" · ")}
            </Info>
            <Info rotulo="Documento florestal">{e.documentoFlorestal}</Info>
            <Info rotulo="Medição">{modo ? `${modo.rotulo} (${modo.sigla})` : e.modoMedicao}</Info>
            {e.modoMedicao === "estereo" && (
              <Info rotulo="Carga (C × L × A)">
                {formatNumero(e.cargaComprimentoM, 2)} × {formatNumero(e.cargaLarguraM, 2)} ×{" "}
                {formatNumero(e.cargaAlturaM, 2)} m
              </Info>
            )}
            {e.modoMedicao === "tonelada" && (
              <Info rotulo="Bruto − tara = líquido">
                {formatNumero(e.pesoBrutoKg, 0)} − {formatNumero(e.taraKg, 0)} ={" "}
                {formatNumero(e.pesoLiquidoKg, 0)} kg
              </Info>
            )}
          </dl>
          {e.observacoes && (
            <p className="bg-muted/50 mt-4 rounded-lg p-3 text-sm">{e.observacoes}</p>
          )}
        </div>
        <div className="from-primary text-primary-foreground flex flex-col gap-3 rounded-2xl bg-gradient-to-br to-[#5a2f12] p-5">
          <span className="text-primary-foreground/70 text-sm">Quantidade</span>
          <span className="font-heading text-3xl font-semibold tabular-nums">
            {formatNumero(e.quantidade, 3, 6)} {sigla}
          </span>
          <span className="text-primary-foreground/70 text-sm">
            {formatMoeda(e.valorUnitario)}/{sigla}
          </span>
          <div className="h-px bg-white/20" />
          <span className="text-primary-foreground/70 text-sm">Total</span>
          <span
            className={cn(
              "font-heading text-3xl font-semibold tabular-nums",
              e.statusPagamento === "pago" && "text-emerald-300"
            )}
          >
            {formatMoeda(e.valorTotal)}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <BadgePagamento status={e.statusPagamento} forte />
            {e.statusPagamento === "pago" ? (
              <span className="text-sm font-medium text-emerald-200">quitado</span>
            ) : (
              restante > 0 && (
                <span className="text-primary-foreground/90 text-sm">
                  falta <b className="text-amber-300">{formatMoeda(restante)}</b>
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {dados.toras.length > 0 && (
        <section className="bg-card rounded-2xl border p-5">
          <h2 className="font-heading mb-3 text-lg font-semibold">Toras medidas</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-muted-foreground text-left">
                <tr>
                  <th className="py-2 font-medium">Diâmetro</th>
                  <th className="font-medium">Comprimento</th>
                  <th className="text-right font-medium">Qtd.</th>
                  <th className="text-right font-medium">Volume</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {dados.toras.map((t) => (
                  <tr key={t.id} className="border-t">
                    <td className="py-2">{formatNumero(t.diametroCm, 0, 2)} cm</td>
                    <td>{formatNumero(t.comprimentoM, 2, 3)} m</td>
                    <td className="text-right">{t.quantidade}</td>
                    <td className="text-right">{formatM3(t.volumeM3)} m³</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <Pagamentos entradaId={id} pagamentos={dados.pagamentos} restante={restante} />
    </div>
  )
}
