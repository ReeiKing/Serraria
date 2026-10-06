import {
  AlertTriangle,
  ArrowRight,
  Factory,
  Gauge,
  Inbox,
  PackageCheck,
  TreePine,
  Truck,
  Wallet,
  WalletCards,
  DollarSign,
} from "lucide-react"
import Link from "next/link"

import { FiltroPeriodo } from "@/components/painel/filtro-periodo"
import {
  GraficoComprasVendas,
  GraficoEstoque,
  GraficoVendasEspecie,
  GraficoVendasQualidade,
} from "@/components/painel/graficos"
import { NumeroAnimado } from "@/components/painel/numero-animado"
import { BadgeVenda } from "@/components/sistema/badge-venda"
import { CartaoIndicador } from "@/components/sistema/cartao-indicador"
import { comUsuario } from "@/db"
import { exigirUsuario } from "@/lib/auth/sessao"
import { dadosPainel } from "@/lib/consultas/painel"
import { formatDataHora, formatMoeda, formatNumero } from "@/lib/format"
import { resolverPeriodo } from "@/lib/periodo"
import { SIGLA_UNIDADE } from "@/lib/schemas/entradas"
import type { STATUS_VENDA } from "@/lib/vendas"

export const metadata = { title: "Painel" }

function Painel({
  titulo,
  descricao,
  children,
  acao,
}: {
  titulo: string
  descricao?: string
  children: React.ReactNode
  acao?: React.ReactNode
}) {
  return (
    <section className="bg-card flex flex-col gap-3 rounded-2xl border p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="font-heading text-lg font-semibold">{titulo}</h2>
          {descricao && <p className="text-muted-foreground text-sm">{descricao}</p>}
        </div>
        {acao}
      </div>
      {children}
    </section>
  )
}

function Aviso({
  href,
  icone,
  texto,
  ativo,
}: {
  href: string
  icone: React.ReactNode
  texto: string
  ativo: boolean
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors ${ativo ? "border-alerta/50 bg-alerta/10 hover:bg-alerta/20" : "bg-card text-muted-foreground hover:bg-muted"}`}
    >
      <span className="[&_svg]:size-5">{icone}</span>
      <span className="flex-1 font-medium">{texto}</span>
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
    </Link>
  )
}

export default async function PainelPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string; de?: string; ate?: string }>
}) {
  const usuario = await exigirUsuario()
  const periodo = resolverPeriodo(await searchParams)
  const d = await comUsuario((tx) => dadosPainel(tx, periodo))
  const i = d.indicadores

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-semibold">Olá, {usuario.nome.split(" ")[0]}</h1>
          <p className="text-muted-foreground">
            Resumo da serraria — {periodo.rotulo.toLowerCase()}.
          </p>
        </div>
        <FiltroPeriodo periodo={periodo} />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Aviso
          href="/sistema/estoque"
          icone={<AlertTriangle />}
          ativo={i.estoqueBaixo > 0}
          texto={
            i.estoqueBaixo
              ? `${i.estoqueBaixo} ${i.estoqueBaixo === 1 ? "item" : "itens"} com estoque baixo`
              : "Estoque sem alertas"
          }
        />
        <Aviso
          href="/sistema/vendas"
          icone={<Truck />}
          ativo={i.aEntregar > 0}
          texto={
            i.aEntregar
              ? `${i.aEntregar} ${i.aEntregar === 1 ? "carga confirmada" : "cargas confirmadas"} a entregar`
              : "Nenhuma carga pendente"
          }
        />
        <Aviso
          href="/sistema/orcamentos"
          icone={<Inbox />}
          ativo={i.orcamentosNovos > 0}
          texto={
            i.orcamentosNovos
              ? `${i.orcamentosNovos} ${i.orcamentosNovos === 1 ? "pedido de orçamento novo" : "pedidos de orçamento novos"} do site`
              : "Nenhum orçamento novo"
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CartaoIndicador
          destaque
          titulo="Faturamento"
          icone={<DollarSign />}
          valor={<NumeroAnimado valor={i.faturamento} formato="moeda" />}
          detalhe={`${i.vendasQtd} ${i.vendasQtd === 1 ? "venda confirmada" : "vendas confirmadas"}`}
        />
        <CartaoIndicador
          titulo="Madeira vendida"
          icone={<PackageCheck />}
          valor={<NumeroAnimado valor={i.vendidoM3} formato="m3" />}
          detalhe="serrada, em m³"
          atraso={0.04}
        />
        <CartaoIndicador
          titulo="Serrado produzido"
          icone={<Factory />}
          valor={<NumeroAnimado valor={i.serradoM3} formato="m3" />}
          detalhe="lançamentos de produção"
          atraso={0.08}
        />
        <CartaoIndicador
          titulo="Rendimento médio"
          icone={<Gauge />}
          valor={<NumeroAnimado valor={i.rendimento} formato="pct" />}
          detalhe="m³ serrado ÷ m³ de tora"
          atraso={0.12}
        />
        <CartaoIndicador
          titulo="Toras compradas"
          icone={<TreePine />}
          valor={<NumeroAnimado valor={i.torasM3} formato="m3" />}
          detalhe={`${formatMoeda(i.torasValor)} · estéreo e t convertidos`}
          atraso={0.16}
        />
        <CartaoIndicador
          titulo="Pago a fornecedores"
          icone={<Wallet />}
          valor={<NumeroAnimado valor={i.pago} formato="moeda" />}
          detalhe="pagamentos no período"
          atraso={0.2}
        />
        <CartaoIndicador
          titulo="Contas a pagar"
          icone={<WalletCards />}
          valor={<NumeroAnimado valor={i.aPagar} formato="moeda" />}
          detalhe={`${i.aPagarQtd} cargas de tora em aberto (hoje)`}
          atraso={0.24}
        />
        <CartaoIndicador
          titulo="Ticket médio"
          icone={<DollarSign />}
          valor={
            <NumeroAnimado
              valor={i.vendasQtd ? i.faturamento / i.vendasQtd : null}
              formato="moeda"
            />
          }
          detalhe="por venda no período"
          atraso={0.28}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Painel titulo="Compras × vendas" descricao="Últimos 6 meses, em R$">
          <GraficoComprasVendas dados={d.mensal} />
        </Painel>
        <Painel titulo="Estoque atual" descricao="m³ por espécie e qualidade">
          <GraficoEstoque dados={d.estoque} />
        </Painel>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Painel
          titulo="Vendas por espécie"
          descricao={`m³ vendidos — ${periodo.rotulo.toLowerCase()}`}
        >
          <GraficoVendasEspecie dados={d.porEspecie} />
        </Painel>
        <Painel
          titulo="Vendas por qualidade"
          descricao={`m³ vendidos — ${periodo.rotulo.toLowerCase()}`}
        >
          <GraficoVendasQualidade dados={d.porQualidade} />
        </Painel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Painel
          titulo="Últimas entradas de toras"
          acao={
            <Link href="/sistema/entradas" className="text-primary text-sm hover:underline">
              Ver todas
            </Link>
          }
        >
          <ul className="divide-y">
            {d.ultimasEntradas.map((e) => (
              <li key={e.id}>
                <Link
                  href={`/sistema/entradas/${e.id}`}
                  className="hover:text-primary flex items-center gap-3 py-2.5"
                >
                  <span className="flex-1">
                    <span className="block font-medium">{e.fornecedor}</span>
                    <span className="text-muted-foreground text-xs">
                      nº {e.numero} · {e.especie} · {formatDataHora(e.created_at)}
                    </span>
                  </span>
                  <span className="text-right text-sm tabular-nums">
                    <span className="block">
                      {formatNumero(e.quantidade, 2, 3)} {SIGLA_UNIDADE[e.unidade]}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {formatMoeda(e.valor_total)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Painel>
        <Painel
          titulo="Últimas cargas de saída"
          acao={
            <Link href="/sistema/vendas" className="text-primary text-sm hover:underline">
              Ver todas
            </Link>
          }
        >
          <ul className="divide-y">
            {d.ultimasVendas.map((v) => (
              <li key={v.id}>
                <Link
                  href={`/sistema/vendas/${v.id}`}
                  className="hover:text-primary flex items-center gap-3 py-2.5"
                >
                  <span className="flex-1">
                    <span className="block font-medium">{v.cliente}</span>
                    <span className="text-muted-foreground text-xs">
                      nº {v.numero} · {formatDataHora(v.created_at)}
                    </span>
                  </span>
                  <BadgeVenda status={v.status as keyof typeof STATUS_VENDA} />
                  <span className="text-right text-sm tabular-nums">
                    <span className="block">{formatNumero(v.total_m3, 2, 3)} m³</span>
                    <span className="text-muted-foreground text-xs">
                      {formatMoeda(v.valor_total)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Painel>
      </div>
    </div>
  )
}
