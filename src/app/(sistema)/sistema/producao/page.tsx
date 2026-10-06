import { desc, eq, sql } from "drizzle-orm"
import { Factory, Gauge, Plus, TreePine } from "lucide-react"
import Link from "next/link"

import { Abas } from "@/components/sistema/abas"
import { CabecalhoPagina } from "@/components/sistema/cabecalho-pagina"
import { CartaoIndicador } from "@/components/sistema/cartao-indicador"
import { Button } from "@/components/ui/button"
import { comUsuario, especies, producoes } from "@/db"
import { formatNumero, formatPercentual } from "@/lib/format"

import { ListaProducoes } from "./lista"
import { ListaMontagens } from "./montagens"

export const metadata = { title: "Produção" }

export default async function ProducaoPage({
  searchParams,
}: {
  searchParams: Promise<{ aba?: string }>
}) {
  const aba = (await searchParams).aba === "produtos" ? "produtos" : "madeira"
  const { linhas, mes, toras, montagens } = await comUsuario(async (tx) => {
    const [linhas, [mes], toras, montagens] = await Promise.all([
      tx
        .select({
          id: producoes.id,
          numero: producoes.numero,
          dataProducao: producoes.dataProducao,
          especie: especies.nome,
          torasConsumidasM3: producoes.torasConsumidasM3,
          volumeSerradoM3: producoes.volumeSerradoM3,
          totalPecas: producoes.totalPecas,
          rendimento: producoes.rendimentoPercentual,
          estornadaEm: producoes.estornadaEm,
        })
        .from(producoes)
        .innerJoin(especies, eq(especies.id, producoes.especieId))
        .orderBy(desc(producoes.dataProducao), desc(producoes.numero))
        .limit(1000),
      tx
        .select({
          serrado: sql<string>`coalesce(sum(${producoes.volumeSerradoM3}), 0)`,
          tora: sql<string>`coalesce(sum(${producoes.torasConsumidasM3}) filter (where ${producoes.torasConsumidasM3} > 0), 0)`,
          serradoComTora: sql<string>`coalesce(sum(${producoes.volumeSerradoM3}) filter (where ${producoes.torasConsumidasM3} > 0), 0)`,
        })
        .from(producoes)
        .where(
          sql`${producoes.estornadaEm} is null and date_trunc('month', ${producoes.dataProducao}) = date_trunc('month', (now() at time zone 'America/Sao_Paulo')::date)`
        ),
      tx.execute<{ especie: string; saldo_m3: string }>(
        sql`select especie, saldo_m3 from public.estoque_toras_equivalente order by especie`
      ),
      tx.execute<{
        id: string
        numero: number
        data_producao: string
        total_unidades: number
        resumo: string
        estornada_em: string | null
      }>(sql`
        select pp.id, pp.numero, pp.data_producao, pp.total_unidades, pp.estornada_em,
               string_agg(ppi.quantidade || ' × ' || pr.nome, ', ' order by pr.nome) as resumo
          from public.producoes_produtos pp
          join public.producoes_produtos_itens ppi on ppi.producao_id = pp.id
          join public.produtos pr on pr.id = ppi.produto_id
         group by pp.id order by pp.data_producao desc, pp.numero desc limit 500`),
    ])
    return { linhas, mes, toras, montagens }
  })

  const rendimentoMes =
    Number(mes?.tora) > 0 ? (Number(mes?.serradoComTora) / Number(mes?.tora)) * 100 : null

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <CabecalhoPagina
        titulo="Produção"
        descricao="Transforma toras em madeira serrada: as peças entram no estoque e as toras são baixadas."
        acoes={
          <Button asChild size="lg" className="h-12 text-base">
            <Link href="/sistema/producao/nova">
              <Plus /> Lançar produção
            </Link>
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <CartaoIndicador
          titulo="Serrado no mês"
          icone={<Factory />}
          valor={`${formatNumero(mes?.serrado, 2, 3)} m³`}
        />
        <CartaoIndicador
          destaque
          titulo="Rendimento médio no mês"
          icone={<Gauge />}
          valor={rendimentoMes === null ? "—" : formatPercentual(rendimentoMes)}
          detalhe="m³ serrado ÷ m³ de tora consumida"
          atraso={0.05}
        />
        <CartaoIndicador
          titulo="Toras em estoque (equiv. m³)"
          icone={<TreePine />}
          atraso={0.1}
          valor={
            <span className="flex flex-col text-xl md:text-2xl">
              {toras.map((t) => (
                <span key={t.especie}>
                  {t.especie}: {formatNumero(t.saldo_m3, 1, 1)} m³
                </span>
              ))}
            </span>
          }
          detalhe="Estéreo e tonelada convertidos pelos fatores da espécie"
        />
      </div>
      <Abas
        atual={aba}
        abas={[
          { valor: "madeira", rotulo: "Madeira serrada", href: "/sistema/producao" },
          {
            valor: "produtos",
            rotulo: "Paletes e caixotes",
            href: "/sistema/producao?aba=produtos",
          },
        ]}
      />
      {aba === "produtos" ? (
        <>
          <Button asChild size="lg" variant="outline" className="h-12 self-start text-base">
            <Link href="/sistema/producao/produtos/nova">
              <Plus /> Lançar montagem de paletes/caixotes
            </Link>
          </Button>
          <ListaMontagens
            dados={montagens.map((x) => ({
              id: x.id,
              numero: x.numero,
              dataProducao: String(x.data_producao).slice(0, 10),
              totalUnidades: x.total_unidades,
              resumo: x.resumo,
              estornadaEm: x.estornada_em,
            }))}
          />
        </>
      ) : (
        <ListaProducoes dados={linhas} />
      )}
    </div>
  )
}
