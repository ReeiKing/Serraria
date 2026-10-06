import { desc, eq, sql } from "drizzle-orm"
import { DollarSign, PackageCheck, Plus, Truck } from "lucide-react"
import Link from "next/link"

import { CabecalhoPagina } from "@/components/sistema/cabecalho-pagina"
import { CartaoIndicador } from "@/components/sistema/cartao-indicador"
import { Button } from "@/components/ui/button"
import { clientes, comUsuario, romaneios, vendas } from "@/db"
import { formatMoeda, formatNumero } from "@/lib/format"

import { ListaVendas } from "./lista"

export const metadata = { title: "Vendas e romaneios" }

const DO_MES = sql`date_trunc('month', ${vendas.confirmadaEm} at time zone 'America/Sao_Paulo') = date_trunc('month', now() at time zone 'America/Sao_Paulo')`

export default async function VendasPage() {
  const { linhas, mes, aEntregar } = await comUsuario(async (tx) => {
    const [linhas, [mes], [aEntregar]] = await Promise.all([
      tx
        .select({
          id: vendas.id,
          numero: vendas.numero,
          createdAt: vendas.createdAt,
          cliente: clientes.razaoSocial,
          destino: sql<string>`concat_ws('/', ${vendas.destinoMunicipio}, ${vendas.destinoUf})`,
          placa: vendas.placa,
          totalM3: vendas.totalM3,
          totalPecas: vendas.totalPecas,
          valorTotal: vendas.valorTotal,
          status: vendas.status,
          romaneio: romaneios.numero,
        })
        .from(vendas)
        .innerJoin(clientes, eq(clientes.id, vendas.clienteId))
        .leftJoin(romaneios, eq(romaneios.vendaId, vendas.id))
        .orderBy(desc(vendas.createdAt))
        .limit(1000),
      tx
        .select({
          valor: sql<string>`coalesce(sum(${vendas.valorTotal}), 0)`,
          m3: sql<string>`coalesce(sum(${vendas.totalM3}), 0)`,
          qtd: sql<number>`count(*)::int`,
        })
        .from(vendas)
        .where(sql`${vendas.status} in ('confirmada','nfe_emitida','entregue') and ${DO_MES}`),
      tx
        .select({
          qtd: sql<number>`count(*)::int`,
          m3: sql<string>`coalesce(sum(${vendas.totalM3}), 0)`,
        })
        .from(vendas)
        .where(sql`${vendas.status} in ('confirmada','nfe_emitida')`),
    ])
    return { linhas, mes, aEntregar }
  })

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <CabecalhoPagina
        titulo="Vendas e romaneios"
        descricao="Cargas de saída de madeira serrada. Ao confirmar, o estoque é baixado e o romaneio é gerado."
        acoes={
          <Button asChild size="lg" className="h-12 text-base">
            <Link href="/sistema/vendas/nova">
              <Plus /> Nova venda
            </Link>
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <CartaoIndicador
          destaque
          titulo="Faturamento no mês"
          icone={<DollarSign />}
          valor={formatMoeda(mes?.valor)}
          detalhe={`${mes?.qtd ?? 0} vendas confirmadas`}
        />
        <CartaoIndicador
          titulo="Vendido no mês"
          icone={<PackageCheck />}
          valor={`${formatNumero(mes?.m3, 2, 3)} m³`}
          atraso={0.05}
        />
        <CartaoIndicador
          titulo="Cargas a entregar"
          icone={<Truck />}
          valor={aEntregar?.qtd ?? 0}
          detalhe={`${formatNumero(aEntregar?.m3, 2, 3)} m³ confirmados`}
          atraso={0.1}
        />
      </div>
      <ListaVendas dados={linhas} />
    </div>
  )
}
