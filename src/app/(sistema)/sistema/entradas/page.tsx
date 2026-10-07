import { desc, eq, sql } from "drizzle-orm"
import { Plus, TreePine, Truck, Wallet } from "lucide-react"
import Link from "next/link"

import { CabecalhoPagina } from "@/components/sistema/cabecalho-pagina"
import { CartaoIndicador } from "@/components/sistema/cartao-indicador"
import { Button } from "@/components/ui/button"
import { comUsuario, entradasToras, especies, fornecedores } from "@/db"
import { formatMoeda, formatNumero } from "@/lib/format"

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
      // saldo convertido em m³ (estéreo e tonelada pelos fatores da espécie), pois a
      // produção consome em m³ e somar unidades diferentes daria saldos negativos
      tx.execute<{ especie: string; saldo_m3: string }>(sql`
        select especie, saldo_m3 from public.estoque_toras_equivalente order by especie`),
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
                  <span key={s.especie}>
                    {s.especie}: {formatNumero(s.saldo_m3, 1, 1)} m³
                  </span>
                ))}
              </span>
            ) : (
              "—"
            )
          }
          detalhe="Compras menos o consumo, em m³ (estéreo e t convertidos)"
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
