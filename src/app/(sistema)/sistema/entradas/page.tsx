import { desc, eq, sql } from "drizzle-orm"
import { Plus, TreePine, Truck, Wallet } from "lucide-react"
import Link from "next/link"

import { CabecalhoPagina } from "@/components/sistema/cabecalho-pagina"
import { CartaoIndicador } from "@/components/sistema/cartao-indicador"
import { Button } from "@/components/ui/button"
import { comUsuario, entradasToras, especies, fornecedores } from "@/db"
import { formatMoeda, formatNumero } from "@/lib/format"
import { SIGLA_UNIDADE } from "@/lib/schemas/entradas"

import { ListaEntradas } from "./lista"

export const metadata = { title: "Entrada de toras" }

export default async function EntradasPage() {
  const { linhas, saldos, aPagar, mes } = await comUsuario(async (tx) => {
    const [linhas, saldos, [aPagar], [mes]] = await Promise.all([
      tx
        .select({
          id: entradasToras.id,
          numero: entradasToras.numero,
          createdAt: entradasToras.createdAt,
          especie: especies.nome,
          fornecedor: fornecedores.nome,
          placa: entradasToras.placa,
          quantidade: entradasToras.quantidade,
          unidade: entradasToras.unidade,
          valorTotal: entradasToras.valorTotal,
          valorPago: entradasToras.valorPago,
          statusPagamento: entradasToras.statusPagamento,
        })
        .from(entradasToras)
        .innerJoin(especies, eq(especies.id, entradasToras.especieId))
        .innerJoin(fornecedores, eq(fornecedores.id, entradasToras.fornecedorId))
        .orderBy(desc(entradasToras.createdAt))
        .limit(1000),
      tx.execute<{ especie: string; unidade: string; saldo: string }>(sql`
        select e.nome as especie, s.unidade, s.saldo
          from public.estoque_toras_saldo s join public.especies e on e.id = s.especie_id
         where s.saldo <> 0 order by e.nome, s.unidade`),
      tx
        .select({
          total: sql<string>`coalesce(sum(${entradasToras.valorTotal} - ${entradasToras.valorPago}), 0)`,
          qtd: sql<number>`count(*)::int`,
        })
        .from(entradasToras)
        .where(sql`${entradasToras.statusPagamento} <> 'pago'`),
      tx
        .select({
          qtd: sql<number>`count(*)::int`,
          valor: sql<string>`coalesce(sum(${entradasToras.valorTotal}), 0)`,
        })
        .from(entradasToras)
        .where(
          sql`date_trunc('month', ${entradasToras.createdAt} at time zone 'America/Sao_Paulo') = date_trunc('month', now() at time zone 'America/Sao_Paulo')`
        ),
    ])
    return { linhas, saldos, aPagar, mes }
  })

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <CabecalhoPagina
        titulo="Entrada de toras"
        descricao="Compra de toras: cada carga recebida alimenta o estoque de toras."
        acoes={
          <Button asChild size="lg" className="h-12 text-base">
            <Link href="/sistema/entradas/nova">
              <Plus /> Nova entrada
            </Link>
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <CartaoIndicador
          titulo="Estoque de toras"
          icone={<TreePine />}
          valor={
            saldos.length ? (
              <span className="flex flex-col text-xl md:text-2xl">
                {saldos.map((s) => (
                  <span key={`${s.especie}${s.unidade}`}>
                    {s.especie}: {formatNumero(s.saldo, 2, 3)} {SIGLA_UNIDADE[s.unidade]}
                  </span>
                ))}
              </span>
            ) : (
              "—"
            )
          }
          detalhe="Compras menos o consumo na produção"
        />
        <CartaoIndicador
          titulo="Entradas no mês"
          icone={<Truck />}
          valor={mes?.qtd ?? 0}
          detalhe={`${formatMoeda(mes?.valor)} em toras`}
          atraso={0.05}
        />
        <CartaoIndicador
          destaque
          titulo="A pagar a fornecedores"
          icone={<Wallet />}
          valor={formatMoeda(aPagar?.total)}
          detalhe={`${aPagar?.qtd ?? 0} cargas em aberto`}
          atraso={0.1}
        />
      </div>
      <ListaEntradas dados={linhas} />
    </div>
  )
}
