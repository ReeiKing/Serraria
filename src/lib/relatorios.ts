import "server-only"

import { sql, type SQL } from "drizzle-orm"

import type { Tx } from "@/db"
import { formatBitola } from "@/lib/format"
import type { Periodo } from "@/lib/periodo"

export type TipoColuna =
  "texto" | "moeda" | "m3" | "numero" | "inteiro" | "data" | "datahora" | "pct"
export type Coluna = { chave: string; rotulo: string; tipo: TipoColuna; total?: boolean }
export type Linha = Record<string, string | number | null>

export type FiltrosRelatorio = {
  periodo: Periodo
  especieId?: string
  fornecedorId?: string
  clienteId?: string
  motoristaId?: string
}

export const TIPOS_RELATORIO = [
  { valor: "compras", rotulo: "Compras de toras", filtros: ["especie", "fornecedor", "motorista"] },
  { valor: "pagamentos", rotulo: "Pagamentos a fornecedores", filtros: ["fornecedor"] },
  { valor: "producao", rotulo: "Produção", filtros: ["especie"] },
  { valor: "vendas", rotulo: "Vendas", filtros: ["especie", "cliente", "motorista"] },
  { valor: "estoque", rotulo: "Estoque atual", filtros: ["especie"] },
] as const

export type TipoRelatorio = (typeof TIPOS_RELATORIO)[number]["valor"]

export type Relatorio = {
  titulo: string
  subtitulo: string
  colunas: Coluna[]
  linhas: Linha[]
  usaPeriodo: boolean
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const filtro = (id: string | undefined, coluna: string): SQL =>
  id && UUID.test(id) ? sql`and ${sql.raw(coluna)} = ${id}::uuid` : sql``
const diaSP = (col: string) => sql.raw(`(${col} at time zone 'America/Sao_Paulo')::date`)

export async function gerarRelatorio(
  tx: Tx,
  tipo: TipoRelatorio,
  f: FiltrosRelatorio
): Promise<Relatorio> {
  const { de, ate, rotulo } = f.periodo
  const sub = `${rotulo}: ${de.split("-").reverse().join("/")} a ${ate.split("-").reverse().join("/")}`

  switch (tipo) {
    case "compras": {
      const linhas = await tx.execute<Linha>(sql`
        select e.numero, e.created_at as data, f.nome as fornecedor, es.nome as especie,
               coalesce(m.nome, '') as motorista, coalesce(e.placa, '') as placa,
               case e.modo_medicao when 'm3' then 'm³' when 'estereo' then 'Estéreo' else 'Tonelada' end as medicao,
               e.quantidade::float8 as quantidade, case e.unidade when 'm3' then 'm³' else e.unidade::text end as unidade,
               e.valor_unitario::float8 as unitario, e.valor_total::float8 as total, e.valor_pago::float8 as pago,
               (e.valor_total - e.valor_pago)::float8 as saldo,
               case e.status_pagamento when 'pago' then 'Pago' when 'parcial' then 'Parcial' else 'Pendente' end as situacao
          from public.entradas_toras e
          join public.fornecedores f on f.id = e.fornecedor_id
          join public.especies es on es.id = e.especie_id
          left join public.motoristas m on m.id = e.motorista_id
         where ${diaSP("e.created_at")} between ${de}::date and ${ate}::date
           ${filtro(f.especieId, "e.especie_id")} ${filtro(f.fornecedorId, "e.fornecedor_id")} ${filtro(f.motoristaId, "e.motorista_id")}
         order by e.created_at`)
      return {
        titulo: "Compras de toras",
        subtitulo: sub,
        usaPeriodo: true,
        linhas,
        colunas: [
          { chave: "numero", rotulo: "Nº", tipo: "inteiro" },
          { chave: "data", rotulo: "Data/hora", tipo: "datahora" },
          { chave: "fornecedor", rotulo: "Fornecedor", tipo: "texto" },
          { chave: "especie", rotulo: "Espécie", tipo: "texto" },
          { chave: "motorista", rotulo: "Motorista", tipo: "texto" },
          { chave: "placa", rotulo: "Placa", tipo: "texto" },
          { chave: "quantidade", rotulo: "Qtd.", tipo: "numero" },
          { chave: "unidade", rotulo: "Un.", tipo: "texto" },
          { chave: "unitario", rotulo: "R$/un.", tipo: "moeda" },
          { chave: "total", rotulo: "Total", tipo: "moeda", total: true },
          { chave: "pago", rotulo: "Pago", tipo: "moeda", total: true },
          { chave: "saldo", rotulo: "A pagar", tipo: "moeda", total: true },
          { chave: "situacao", rotulo: "Situação", tipo: "texto" },
        ],
      }
    }
    case "pagamentos": {
      const linhas = await tx.execute<Linha>(sql`
        select pg.data_pagamento as data, f.nome as fornecedor, e.numero as entrada,
               case pg.forma when 'pix' then 'PIX' when 'transferencia' then 'Transferência' when 'dinheiro' then 'Dinheiro'
                 when 'boleto' then 'Boleto' when 'cheque' then 'Cheque' else 'Outro' end as forma,
               pg.valor::float8 as valor, coalesce(pg.observacao, '') as observacao
          from public.entradas_toras_pagamentos pg
          join public.entradas_toras e on e.id = pg.entrada_id
          join public.fornecedores f on f.id = e.fornecedor_id
         where pg.data_pagamento between ${de}::date and ${ate}::date ${filtro(f.fornecedorId, "e.fornecedor_id")}
         order by pg.data_pagamento, f.nome`)
      return {
        titulo: "Pagamentos a fornecedores",
        subtitulo: sub,
        usaPeriodo: true,
        linhas,
        colunas: [
          { chave: "data", rotulo: "Data", tipo: "data" },
          { chave: "fornecedor", rotulo: "Fornecedor", tipo: "texto" },
          { chave: "entrada", rotulo: "Entrada nº", tipo: "inteiro" },
          { chave: "forma", rotulo: "Forma", tipo: "texto" },
          { chave: "valor", rotulo: "Valor", tipo: "moeda", total: true },
          { chave: "observacao", rotulo: "Observação", tipo: "texto" },
        ],
      }
    }
    case "producao": {
      const linhas = await tx.execute<Linha>(sql`
        select p.numero, p.data_producao as data, es.nome as especie,
               p.toras_consumidas_m3::float8 as tora, p.volume_serrado_m3::float8 as serrado, p.total_pecas as pecas,
               p.rendimento_percentual::float8 as rendimento,
               case when p.estornada_em is null then 'Normal' else 'Estornada' end as situacao
          from public.producoes p join public.especies es on es.id = p.especie_id
         where p.data_producao between ${de}::date and ${ate}::date ${filtro(f.especieId, "p.especie_id")}
         order by p.data_producao, p.numero`)
      return {
        titulo: "Produção",
        subtitulo: sub,
        usaPeriodo: true,
        linhas,
        colunas: [
          { chave: "numero", rotulo: "Nº", tipo: "inteiro" },
          { chave: "data", rotulo: "Data", tipo: "data" },
          { chave: "especie", rotulo: "Espécie", tipo: "texto" },
          { chave: "tora", rotulo: "Tora (m³)", tipo: "m3", total: true },
          { chave: "serrado", rotulo: "Serrado (m³)", tipo: "m3", total: true },
          { chave: "pecas", rotulo: "Peças", tipo: "inteiro", total: true },
          { chave: "rendimento", rotulo: "Rendimento", tipo: "pct" },
          { chave: "situacao", rotulo: "Situação", tipo: "texto" },
        ],
      }
    }
    case "vendas": {
      // com filtro de espécie, lista só os itens daquela espécie
      const linhas = await tx.execute<Linha>(sql`
        select v.numero, v.confirmada_em as data, c.razao_social as cliente,
               concat_ws('/', v.destino_municipio, v.destino_uf) as destino, coalesce(m.nome, '') as motorista,
               coalesce(v.placa, '') as placa, coalesce(r.numero::text, '') as romaneio,
               sum(vi.quantidade)::int as pecas, sum(vi.volume_m3)::float8 as m3,
               sum(vi.valor_total)::float8 as produtos,
               case when ${f.especieId && UUID.test(f.especieId) ? sql`true` : sql`false`} then 0 else v.valor_frete::float8 end as frete,
               case when ${f.especieId && UUID.test(f.especieId) ? sql`true` : sql`false`} then sum(vi.valor_total)::float8 else v.valor_total::float8 end as total,
               case v.status when 'confirmada' then 'Confirmada' when 'nfe_emitida' then 'NF-e emitida' else 'Entregue' end as situacao
          from public.vendas v
          join public.clientes c on c.id = v.cliente_id
          join public.vendas_itens vi on vi.venda_id = v.id
          join public.estoque_itens ei on ei.id = vi.estoque_item_id
          left join public.motoristas m on m.id = v.motorista_id
          left join public.romaneios r on r.venda_id = v.id
         where v.status in ('confirmada','nfe_emitida','entregue')
           and ${diaSP("v.confirmada_em")} between ${de}::date and ${ate}::date
           ${filtro(f.especieId, "ei.especie_id")} ${filtro(f.clienteId, "v.cliente_id")} ${filtro(f.motoristaId, "v.motorista_id")}
         group by v.id, c.razao_social, m.nome, r.numero
         order by v.confirmada_em`)
      return {
        titulo: "Vendas",
        subtitulo: `${sub} · vendas confirmadas, com NF-e ou entregues`,
        usaPeriodo: true,
        linhas,
        colunas: [
          { chave: "numero", rotulo: "Nº", tipo: "inteiro" },
          { chave: "data", rotulo: "Confirmada em", tipo: "datahora" },
          { chave: "cliente", rotulo: "Cliente", tipo: "texto" },
          { chave: "destino", rotulo: "Destino", tipo: "texto" },
          { chave: "motorista", rotulo: "Motorista", tipo: "texto" },
          { chave: "romaneio", rotulo: "Romaneio", tipo: "texto" },
          { chave: "pecas", rotulo: "Peças", tipo: "inteiro", total: true },
          { chave: "m3", rotulo: "m³", tipo: "m3", total: true },
          { chave: "produtos", rotulo: "Produtos", tipo: "moeda", total: true },
          { chave: "frete", rotulo: "Frete", tipo: "moeda", total: true },
          { chave: "total", rotulo: "Total", tipo: "moeda", total: true },
          { chave: "situacao", rotulo: "Situação", tipo: "texto" },
        ],
      }
    }
    case "estoque": {
      const brutas = await tx.execute<Linha & { esp: string; larg: string; comp: string }>(sql`
        select es.nome as especie, ei.espessura_cm as esp, ei.largura_cm as larg, ei.comprimento_m as comp,
               q.nome as qualidade, ei.saldo_pecas as pecas, ei.saldo_m3::float8 as m3,
               pv.valor::float8 as preco, (ei.saldo_m3 * coalesce(pv.valor, 0))::float8 as valor,
               ei.estoque_minimo_pecas as minimo
          from public.estoque_itens ei
          join public.especies es on es.id = ei.especie_id
          join public.qualidades q on q.id = ei.qualidade_id
          left join public.precos_vigentes pv on pv.tipo = 'venda_serrada' and pv.especie_id = ei.especie_id
               and pv.qualidade_id = ei.qualidade_id and pv.unidade = 'm3'
         where ei.saldo_pecas <> 0 ${filtro(f.especieId, "ei.especie_id")}
         order by es.nome, ei.espessura_cm, ei.largura_cm, ei.comprimento_m, q.ordem`)
      const linhas = brutas.map(({ esp, larg, comp, ...l }) => ({
        ...l,
        bitola: formatBitola(esp, larg, comp),
      }))
      return {
        titulo: "Estoque atual",
        subtitulo: "Posição na data de emissão (o período não se aplica)",
        usaPeriodo: false,
        linhas,
        colunas: [
          { chave: "especie", rotulo: "Espécie", tipo: "texto" },
          { chave: "bitola", rotulo: "Bitola (cm × cm × m)", tipo: "texto" },
          { chave: "qualidade", rotulo: "Qualidade", tipo: "texto" },
          { chave: "pecas", rotulo: "Peças", tipo: "inteiro", total: true },
          { chave: "m3", rotulo: "m³", tipo: "m3", total: true },
          { chave: "preco", rotulo: "R$/m³", tipo: "moeda" },
          { chave: "valor", rotulo: "Valor estimado", tipo: "moeda", total: true },
          { chave: "minimo", rotulo: "Mínimo", tipo: "inteiro" },
        ],
      }
    }
  }
}

export function totais(r: Relatorio) {
  return Object.fromEntries(
    r.colunas
      .filter((c) => c.total)
      .map((c) => [c.chave, r.linhas.reduce((a, l) => a + (Number(l[c.chave]) || 0), 0)])
  ) as Record<string, number>
}
