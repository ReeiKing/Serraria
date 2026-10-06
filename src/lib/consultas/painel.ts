import "server-only"

import { sql } from "drizzle-orm"

import type { Tx } from "@/db"
import type { Periodo } from "@/lib/periodo"

const DIA = (col: string) => sql.raw(`(${col} at time zone 'America/Sao_Paulo')::date`)
const VENDIDA = sql.raw(`v.status in ('confirmada','nfe_emitida','entregue')`)

/** Indicadores, séries dos gráficos e listas do painel para o período. */
export async function dadosPainel(tx: Tx, p: Periodo) {
  const entre = (col: string) => sql`${DIA(col)} between ${p.de}::date and ${p.ate}::date`

  const [indicadores] = await tx.execute<{
    toras_m3: string
    toras_valor: string
    pago: string
    serrado_m3: string
    rend_serrado: string
    rend_tora: string
    vendido_m3: string
    faturamento: string
    vendas_qtd: number
    a_pagar: string
    a_pagar_qtd: number
    estoque_baixo: number
    a_entregar: number
    orcamentos_novos: number
  }>(sql`
    select
      (select coalesce(sum(e.quantidade * case e.unidade when 'm3' then 1 when 'st' then es.fator_st_m3 else es.fator_t_m3 end), 0)
         from public.entradas_toras e join public.especies es on es.id = e.especie_id
        where ${entre("e.created_at")}) as toras_m3,
      (select coalesce(sum(e.valor_total), 0) from public.entradas_toras e where ${entre("e.created_at")}) as toras_valor,
      (select coalesce(sum(pg.valor), 0) from public.entradas_toras_pagamentos pg
        where pg.data_pagamento between ${p.de}::date and ${p.ate}::date) as pago,
      (select coalesce(sum(pr.volume_serrado_m3), 0) from public.producoes pr
        where pr.estornada_em is null and pr.data_producao between ${p.de}::date and ${p.ate}::date) as serrado_m3,
      (select coalesce(sum(pr.volume_serrado_m3), 0) from public.producoes pr
        where pr.estornada_em is null and pr.toras_consumidas_m3 > 0 and pr.data_producao between ${p.de}::date and ${p.ate}::date) as rend_serrado,
      (select coalesce(sum(pr.toras_consumidas_m3), 0) from public.producoes pr
        where pr.estornada_em is null and pr.toras_consumidas_m3 > 0 and pr.data_producao between ${p.de}::date and ${p.ate}::date) as rend_tora,
      (select coalesce(sum(v.total_m3), 0) from public.vendas v where ${VENDIDA} and ${entre("v.confirmada_em")}) as vendido_m3,
      (select coalesce(sum(v.valor_total), 0) from public.vendas v where ${VENDIDA} and ${entre("v.confirmada_em")}) as faturamento,
      (select count(*)::int from public.vendas v where ${VENDIDA} and ${entre("v.confirmada_em")}) as vendas_qtd,
      (select coalesce(sum(valor_total - valor_pago), 0) from public.entradas_toras where status_pagamento <> 'pago') as a_pagar,
      (select count(*)::int from public.entradas_toras where status_pagamento <> 'pago') as a_pagar_qtd,
      (select count(*)::int from public.estoque_itens
        where saldo_pecas < 0 or (estoque_minimo_pecas > 0 and saldo_pecas <= estoque_minimo_pecas)) as estoque_baixo,
      (select count(*)::int from public.vendas where status in ('confirmada','nfe_emitida')) as a_entregar,
      (select count(*)::int from public.orcamentos_site where status = 'novo') as orcamentos_novos
  `)

  // Compras × vendas nos últimos 6 meses (independe do filtro: mostra tendência)
  const mensal = await tx.execute<{ mes: string; compras: string; vendas: string }>(sql`
    with meses as (
      select generate_series(
        date_trunc('month', (now() at time zone 'America/Sao_Paulo')) - interval '5 months',
        date_trunc('month', (now() at time zone 'America/Sao_Paulo')),
        interval '1 month')::date as mes)
    select to_char(m.mes, 'YYYY-MM') as mes,
      (select coalesce(sum(e.valor_total), 0) from public.entradas_toras e
        where date_trunc('month', e.created_at at time zone 'America/Sao_Paulo')::date = m.mes) as compras,
      (select coalesce(sum(v.valor_total), 0) from public.vendas v
        where ${VENDIDA} and date_trunc('month', v.confirmada_em at time zone 'America/Sao_Paulo')::date = m.mes) as vendas
    from meses m order by m.mes`)

  const porEspecie = await tx.execute<{ especie: string; m3: string; valor: string }>(sql`
    select es.nome as especie, coalesce(sum(vi.volume_m3), 0) as m3, coalesce(sum(vi.valor_total), 0) as valor
      from public.vendas v
      join public.vendas_itens vi on vi.venda_id = v.id
      join public.estoque_itens ei on ei.id = vi.estoque_item_id
      join public.especies es on es.id = ei.especie_id
     where ${VENDIDA} and ${entre("v.confirmada_em")}
     group by es.nome order by es.nome`)

  const porQualidade = await tx.execute<{
    qualidade: string
    ordem: number
    m3: string
    valor: string
  }>(sql`
    select q.nome as qualidade, q.ordem, coalesce(sum(vi.volume_m3), 0) as m3, coalesce(sum(vi.valor_total), 0) as valor
      from public.vendas v
      join public.vendas_itens vi on vi.venda_id = v.id
      join public.estoque_itens ei on ei.id = vi.estoque_item_id
      join public.qualidades q on q.id = ei.qualidade_id
     where ${VENDIDA} and ${entre("v.confirmada_em")}
     group by q.nome, q.ordem order by q.ordem`)

  const estoque = await tx.execute<{
    especie: string
    qualidade: string
    ordem: number
    m3: string
  }>(sql`
    select es.nome as especie, q.nome as qualidade, q.ordem, coalesce(sum(greatest(ei.saldo_m3, 0)), 0) as m3
      from public.estoque_itens ei
      join public.especies es on es.id = ei.especie_id
      join public.qualidades q on q.id = ei.qualidade_id
     group by es.nome, q.nome, q.ordem order by es.nome, q.ordem`)

  const ultimasEntradas = await tx.execute<{
    id: string
    numero: number
    created_at: string
    fornecedor: string
    especie: string
    quantidade: string
    unidade: string
    valor_total: string
  }>(sql`
    select e.id, e.numero, e.created_at, f.nome as fornecedor, es.nome as especie, e.quantidade, e.unidade, e.valor_total
      from public.entradas_toras e
      join public.fornecedores f on f.id = e.fornecedor_id
      join public.especies es on es.id = e.especie_id
     order by e.created_at desc limit 5`)

  const ultimasVendas = await tx.execute<{
    id: string
    numero: number
    created_at: string
    cliente: string
    total_m3: string
    valor_total: string
    status: string
  }>(sql`
    select v.id, v.numero, v.created_at, c.razao_social as cliente, v.total_m3, v.valor_total, v.status
      from public.vendas v join public.clientes c on c.id = v.cliente_id
     order by v.created_at desc limit 5`)

  const i = indicadores!
  return {
    indicadores: {
      torasM3: Number(i.toras_m3),
      torasValor: Number(i.toras_valor),
      pago: Number(i.pago),
      serradoM3: Number(i.serrado_m3),
      rendimento:
        Number(i.rend_tora) > 0 ? (Number(i.rend_serrado) / Number(i.rend_tora)) * 100 : null,
      vendidoM3: Number(i.vendido_m3),
      faturamento: Number(i.faturamento),
      vendasQtd: i.vendas_qtd,
      aPagar: Number(i.a_pagar),
      aPagarQtd: i.a_pagar_qtd,
      estoqueBaixo: i.estoque_baixo,
      aEntregar: i.a_entregar,
      orcamentosNovos: i.orcamentos_novos,
    },
    mensal: mensal.map((m) => ({
      mes: m.mes,
      compras: Number(m.compras),
      vendas: Number(m.vendas),
    })),
    porEspecie: porEspecie.map((e) => ({
      especie: e.especie,
      m3: Number(e.m3),
      valor: Number(e.valor),
    })),
    porQualidade: porQualidade.map((q) => ({
      qualidade: q.qualidade,
      m3: Number(q.m3),
      valor: Number(q.valor),
    })),
    estoque: estoque.map((e) => ({
      especie: e.especie,
      qualidade: e.qualidade,
      ordem: e.ordem,
      m3: Number(e.m3),
    })),
    ultimasEntradas,
    ultimasVendas,
  }
}

export type DadosPainel = Awaited<ReturnType<typeof dadosPainel>>
