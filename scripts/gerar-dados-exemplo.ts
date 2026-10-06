/**
 * Gera supabase/seeds/dados_exemplo.sql — dados fictícios para analisar o sistema.
 * Usa as mesmas funções de cálculo da aplicação. Rode: npx tsx scripts/gerar-dados-exemplo.ts
 */
import { writeFileSync } from "node:fs"

import { paraNumeric } from "../src/lib/calculos"
import { calcularEntrada, type DadosMedicao } from "../src/lib/entradas"
import { calcularProducao } from "../src/lib/producao"
import { calcularVenda, descricaoItem } from "../src/lib/vendas"

const SECRETARIA = "00000000-0000-0000-0000-000000000001"

// pseudo-aleatório determinístico
let semente = 2026
const r = () => ((semente = (semente * 16807) % 2147483647) - 1) / 2147483646
const escolher = <T>(lista: T[]) => lista[Math.floor(r() * lista.length)]!
const id = (prefixo: string, n: number) =>
  `${prefixo}0000000-0000-0000-0000-${String(n).padStart(12, "0")}`
const q = (v: string | number | null) =>
  v === null ? "null" : typeof v === "number" ? String(v) : `'${v.replace(/'/g, "''")}'`

function dvCpf(base: string) {
  const calc = (b: string, p: number) => {
    const s = [...b].reduce((a, d, i) => a + Number(d) * (p - i), 0)
    const resto = (s * 10) % 11
    return resto === 10 ? 0 : resto
  }
  const d1 = calc(base, 10)
  return base + d1 + calc(base + d1, 11)
}
function dvCnpj(base: string) {
  const calc = (b: string) => {
    const pesos =
      b.length === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    const s = [...b].reduce((a, d, i) => a + Number(d) * pesos[i]!, 0)
    return s % 11 < 2 ? 0 : 11 - (s % 11)
  }
  const d1 = calc(base)
  return base + d1 + calc(base + d1)
}

const linhas: string[] = [
  "-- =============================================================================",
  "-- DADOS DE EXEMPLO (fictícios) — gerado por scripts/gerar-dados-exemplo.ts",
  "-- Roda depois do seed.sql no `supabase db reset`. Não edite à mão: rode o gerador.",
  "-- =============================================================================",
  "",
]
const sql = (s: string) => linhas.push(s)

// ---------------------------------------------------------------- cadastros
const fornecedores = [
  {
    nome: "Reflorestadora Campos Gerais Ltda",
    doc: dvCnpj("452187360001"),
    mun: "Ponta Grossa",
    uf: "PR",
    tel: "42999110001",
  },
  {
    nome: "Florestal Tibagi S.A.",
    doc: dvCnpj("308765120001"),
    mun: "Tibagi",
    uf: "PR",
    tel: "42999110002",
  },
  {
    nome: "Sítio Boa Vista (João Pereira)",
    doc: dvCpf("314159265"),
    mun: "Castro",
    uf: "PR",
    tel: "42999110003",
  },
  {
    nome: "Fazenda Santa Rita",
    doc: dvCnpj("271828180001"),
    mun: "Palmeira",
    uf: "PR",
    tel: "42999110004",
  },
]
fornecedores.forEach((f, i) =>
  sql(
    `insert into public.fornecedores (id, nome, documento, telefone, municipio, uf, created_by) values (${q(id("1", i + 1))}, ${q(f.nome)}, ${q(f.doc)}, ${q(f.tel)}, ${q(f.mun)}, ${q(f.uf)}, ${q(SECRETARIA)});`
  )
)

const clientes = [
  {
    razao: "Construtora Horizonte Ltda",
    fantasia: "Horizonte",
    doc: dvCnpj("112223330001"),
    ie: "9012345678",
    ind: 1,
    mun: "Curitiba",
    ibge: "4106902",
    uf: "PR",
    cep: "80010000",
    log: "Rua XV de Novembro",
    num: "1200",
    bairro: "Centro",
  },
  {
    razao: "Marcenaria Bom Lar Ltda",
    fantasia: "Bom Lar Móveis",
    doc: dvCnpj("114447770001"),
    ie: "9087654321",
    ind: 1,
    mun: "Ponta Grossa",
    ibge: "4119905",
    uf: "PR",
    cep: "84010000",
    log: "Av. Vicente Machado",
    num: "455",
    bairro: "Centro",
  },
  {
    razao: "Paletes Sul Indústria Ltda",
    fantasia: "Paletes Sul",
    doc: dvCnpj("223344550001"),
    ie: "2580369147",
    ind: 1,
    mun: "Joinville",
    ibge: "4209102",
    uf: "SC",
    cep: "89201000",
    log: "Rua do Príncipe",
    num: "88",
    bairro: "Centro",
  },
  {
    razao: "Carlos Eduardo Ramos",
    fantasia: "",
    doc: dvCpf("271828182"),
    ie: "",
    ind: 9,
    mun: "Castro",
    ibge: "4104907",
    uf: "PR",
    cep: "84165000",
    log: "Estrada da Colônia",
    num: "s/n",
    bairro: "Zona Rural",
  },
]
clientes.forEach((c, i) =>
  sql(
    `insert into public.clientes (id, razao_social, nome_fantasia, documento, ie, indicador_ie, email, telefone, cep, logradouro, numero, bairro, municipio, codigo_ibge, uf, created_by) values (${q(id("2", i + 1))}, ${q(c.razao)}, ${q(c.fantasia || null)}, ${q(c.doc)}, ${q(c.ie || null)}, ${c.ind}, ${q(`compras${i + 1}@exemplo.com.br`)}, ${q(`4199900${String(i).padStart(4, "0")}`)}, ${q(c.cep)}, ${q(c.log)}, ${q(c.num)}, ${q(c.bairro)}, ${q(c.mun)}, ${q(c.ibge)}, ${q(c.uf)}, ${q(SECRETARIA)});`
  )
)

const motoristas = [
  {
    nome: "Antônio Carlos da Silva",
    cpf: dvCpf("123456789"),
    cnh: "01234567890",
    tel: "42988770001",
  },
  {
    nome: "Marcos Vinícius Souza",
    cpf: dvCpf("987654321"),
    cnh: "09876543210",
    tel: "42988770002",
  },
  {
    nome: "Paulo Roberto Lima",
    cpf: dvCpf("456789123"),
    cnh: "04567891230",
    tel: "42988770003",
    transp: "Transportes Lima",
  },
]
motoristas.forEach((m, i) =>
  sql(
    `insert into public.motoristas (id, nome, cpf, cnh, telefone, transportadora, created_by) values (${q(id("3", i + 1))}, ${q(m.nome)}, ${q(m.cpf)}, ${q(m.cnh)}, ${q(m.tel)}, ${q(m.transp ?? null)}, ${q(SECRETARIA)});`
  )
)

const veiculos = [
  { placa: "BRA2E19", tipo: "bitrem", tara: 18500, uf: "PR", mot: 1 },
  { placa: "MDE4F21", tipo: "truck", tara: 9800, uf: "PR", mot: 2 },
  { placa: "QWE1234", tipo: "carreta", tara: 15250, uf: "PR", mot: 3 },
]
veiculos.forEach((v, i) =>
  sql(
    `insert into public.veiculos (id, placa, tipo, tara_kg, uf, motorista_padrao_id, created_by) values (${q(id("4", i + 1))}, ${q(v.placa)}, ${q(v.tipo)}, ${v.tara}, ${q(v.uf)}, ${q(id("3", v.mot))}, ${q(SECRETARIA)});`
  )
)

// ---------------------------------------------------------------- entradas de toras (jul–out/2026)
sql("")
sql("-- Datas históricas: o gatilho de carimbo é desligado só durante o seed.")
sql("alter table public.entradas_toras disable trigger carimbo;")
sql("alter table public.estoque_toras_mov disable trigger carimbo;")
sql("alter table public.entradas_toras_pagamentos disable trigger carimbo;")

const precos: Record<string, Record<string, number>> = {
  Pinus: { m3: 150, st: 95, t: 135 },
  Eucalipto: { m3: 130, st: 85, t: 120 },
}
const inicio = new Date("2026-07-01T10:00:00-03:00").getTime()
const fim = new Date("2026-10-05T16:00:00-03:00").getTime()
const N_ENTRADAS = 18

for (let i = 0; i < N_ENTRADAS; i++) {
  const quando = new Date(
    inicio + ((fim - inicio) * i) / (N_ENTRADAS - 1) + Math.floor(r() * 6) * 3600_000
  )
  const especie = r() < 0.6 ? "Pinus" : "Eucalipto"
  const modo = escolher(["m3", "m3", "estereo", "tonelada"] as const)
  const veiculo = Math.floor(r() * 3)
  const v = veiculos[veiculo]!
  const unidade = modo === "m3" ? "m3" : modo === "estereo" ? "st" : "t"
  const preco = precos[especie]![unidade]!

  const dados: DadosMedicao = { modoMedicao: modo, valorUnitario: preco }
  if (modo === "estereo")
    Object.assign(dados, {
      cargaComprimentoM: 7.2 + r() * 2,
      cargaLarguraM: 2.5,
      cargaAlturaM: 2.4 + r() * 0.5,
    })
  if (modo === "tonelada")
    Object.assign(dados, { pesoBrutoKg: Math.round(v.tara + 22000 + r() * 12000), taraKg: v.tara })
  if (modo === "m3") {
    dados.toras = Array.from({ length: 4 + Math.floor(r() * 4) }, () => ({
      diametroCm: 18 + Math.floor(r() * 22),
      comprimentoM: escolher([2.4, 2.4, 2.6, 3.1]),
      quantidade: 8 + Math.floor(r() * 30),
    }))
  }
  const c = calcularEntrada(dados)
  const eid = id("5", i + 1)
  const fornecedor = id("1", 1 + Math.floor(r() * fornecedores.length))
  const ts = quando.toISOString()
  const n = (x: unknown, casas: number) =>
    x === undefined ? "null" : q(paraNumeric(x as number, casas))

  sql(
    `insert into public.entradas_toras (id, especie_id, fornecedor_id, motorista_id, veiculo_id, placa, origem, municipio_origem, uf_origem, modo_medicao, carga_comprimento_m, carga_largura_m, carga_altura_m, peso_bruto_kg, tara_kg, peso_liquido_kg, quantidade, unidade, valor_unitario, valor_total, created_at, updated_at, created_by) values (${q(eid)}, (select id from public.especies where nome = ${q(especie)}), ${q(fornecedor)}, ${q(id("3", v.mot))}, ${q(id("4", veiculo + 1))}, ${q(v.placa)}, ${q(`Talhão ${1 + Math.floor(r() * 12)}`)}, ${q(fornecedores[0]!.mun)}, 'PR', ${q(modo)}, ${n(dados.cargaComprimentoM, 3)}, ${n(dados.cargaLarguraM, 3)}, ${n(dados.cargaAlturaM, 3)}, ${n(dados.pesoBrutoKg, 2)}, ${n(dados.taraKg, 2)}, ${c.pesoLiquidoKg === null ? "null" : q(paraNumeric(c.pesoLiquidoKg, 2))}, ${q(paraNumeric(c.quantidade, 6))}, ${q(c.unidade)}, ${q(paraNumeric(preco, 2))}, ${q(paraNumeric(c.valorTotal, 2))}, ${q(ts)}, ${q(ts)}, ${q(SECRETARIA)});`
  )
  for (const t of c.toras) {
    sql(
      `insert into public.entradas_toras_itens (entrada_id, diametro_cm, comprimento_m, quantidade, volume_m3, created_by) values (${q(eid)}, ${t.diametroCm}, ${t.comprimentoM}, ${t.quantidade}, ${q(paraNumeric(t.volumeM3, 6))}, ${q(SECRETARIA)});`
    )
  }
  sql(
    `insert into public.estoque_toras_mov (especie_id, tipo, quantidade, unidade, entrada_id, created_at, updated_at, created_by) values ((select id from public.especies where nome = ${q(especie)}), 'compra', ${q(paraNumeric(c.quantidade, 6))}, ${q(c.unidade)}, ${q(eid)}, ${q(ts)}, ${q(ts)}, ${q(SECRETARIA)});`
  )

  // pagamentos: antigas quitadas, intermediárias parciais, recentes pendentes
  const idade = (fim - quando.getTime()) / 86_400_000
  const pago =
    idade > 45 ? c.valorTotal : idade > 15 ? Math.round(c.valorTotal * 0.5 * 100) / 100 : 0
  if (pago > 0) {
    const dataPag = new Date(quando.getTime() + 10 * 86_400_000).toISOString().slice(0, 10)
    sql(
      `insert into public.entradas_toras_pagamentos (entrada_id, data_pagamento, valor, forma, created_at, updated_at, created_by) values (${q(eid)}, ${q(dataPag)}, ${q(paraNumeric(pago, 2))}, ${q(escolher(["pix", "transferencia", "boleto"]))}, ${q(ts)}, ${q(ts)}, ${q(SECRETARIA)});`
    )
  }
}

sql("alter table public.entradas_toras enable trigger carimbo;")
sql("alter table public.estoque_toras_mov enable trigger carimbo;")
sql("alter table public.entradas_toras_pagamentos enable trigger carimbo;")

// ---------------------------------------------------------------- produção, estoque e vendas
// Eventos com data: são ordenados antes de gerar o SQL, para o saldo do kardex
// (calculado pelo gatilho na ordem de inserção) seguir a ordem cronológica.
sql("")
sql("-- @@ PRODUCAO @@")
const TABELAS_HIST = [
  "producoes",
  "producoes_itens",
  "estoque_mov",
  "estoque_itens",
  "vendas",
  "vendas_itens",
  "romaneios",
]
for (const t of TABELAS_HIST) sql(`alter table public.${t} disable trigger carimbo;`)

type Evento = { ts: number; linhas: string[] }
const eventos: Evento[] = []
const evento = (ts: number, linhas: string[]) => eventos.push({ ts, linhas })

const BITOLAS: Record<string, [number, number, number][]> = {
  Pinus: [
    [2.5, 10, 3],
    [2.5, 15, 3],
    [2.5, 30, 3],
    [5, 5, 3],
    [5, 10, 3],
    [1.8, 9, 1.2],
  ],
  Eucalipto: [
    [5, 15, 4],
    [6, 12, 4],
    [6, 16, 5],
    [2.5, 20, 3],
    [3, 15, 3],
  ],
}
type Item = { id: string; especie: string; ordem: number; b: [number, number, number] }
const itensEstoque = new Map<string, Item>()
const saldo = new Map<string, number>()
let nItem = 0
function itemEstoque(especie: string, ordemQualidade: number, b: [number, number, number]) {
  const chave = `${especie}|${ordemQualidade}|${b.join("x")}`
  let item = itensEstoque.get(chave)
  if (!item) {
    item = { id: id("6", ++nItem), especie, ordem: ordemQualidade, b }
    itensEstoque.set(chave, item)
    saldo.set(item.id, 0)
    // mínimo em algumas bitolas para mostrar o alerta de estoque baixo
    const minimo = ordemQualidade === 1 && nItem % 3 === 0 ? 400 : 0
    sql(
      `insert into public.estoque_itens (id, especie_id, qualidade_id, espessura_cm, largura_cm, comprimento_m, estoque_minimo_pecas, created_at, updated_at, created_by) values (${q(item.id)}, (select id from public.especies where nome = ${q(especie)}), (select id from public.qualidades where ordem = ${ordemQualidade}), ${b[0]}, ${b[1]}, ${b[2]}, ${minimo}, '2026-07-01T12:00:00Z', '2026-07-01T12:00:00Z', ${q(SECRETARIA)});`
    )
  }
  return item
}

// produções
const N_PROD = 22
const producoesGeradas: { ts: number; itens: { item: Item; qtd: number }[] }[] = []
for (let i = 0; i < N_PROD; i++) {
  const quando = inicio + 3 * 86_400_000 + ((fim - inicio - 3 * 86_400_000) * i) / (N_PROD - 1)
  const ts = new Date(quando).toISOString()
  const especie = i % 3 === 2 ? "Eucalipto" : "Pinus"
  const pid = id("7", i + 1)
  const linhasProd = Array.from({ length: 2 + Math.floor(r() * 3) }, () => {
    const b = escolher(BITOLAS[especie]!)
    const ordem = r() < 0.45 ? 1 : r() < 0.75 ? 2 : 3
    const vol = (b[0] / 100) * (b[1] / 100) * b[2]
    const qtd = Math.max(20, Math.round((1.5 + r() * 3) / vol / 10) * 10)
    return { item: itemEstoque(especie, ordem, b), qtd }
  })
  const calc = calcularProducao(
    linhasProd.map((l) => ({
      espessuraCm: l.item.b[0],
      larguraCm: l.item.b[1],
      comprimentoM: l.item.b[2],
      quantidade: l.qtd,
    }))
  )
  const toras = Math.round((calc.volumeSerradoM3 / (0.44 + r() * 0.12)) * 1000) / 1000
  const rend = (calc.volumeSerradoM3 / toras) * 100
  const ls = [
    `insert into public.producoes (id, data_producao, especie_id, toras_consumidas_m3, volume_serrado_m3, total_pecas, rendimento_percentual, created_at, updated_at, created_by) values (${q(pid)}, ${q(ts.slice(0, 10))}, (select id from public.especies where nome = ${q(especie)}), ${q(paraNumeric(toras, 6))}, ${q(paraNumeric(calc.volumeSerradoM3, 6))}, ${calc.totalPecas}, ${q(paraNumeric(rend, 3))}, ${q(ts)}, ${q(ts)}, ${q(SECRETARIA)});`,
  ]
  linhasProd.forEach((l, k) => {
    ls.push(
      `insert into public.producoes_itens (producao_id, estoque_item_id, quantidade, volume_peca_m3, volume_total_m3, created_at, updated_at, created_by) values (${q(pid)}, ${q(l.item.id)}, ${l.qtd}, ${q(paraNumeric(calc.linhas[k]!.volumePecaM3, 6))}, ${q(paraNumeric(calc.linhas[k]!.volumeTotalM3, 6))}, ${q(ts)}, ${q(ts)}, ${q(SECRETARIA)});`,
      `insert into public.estoque_mov (estoque_item_id, tipo, quantidade, producao_id, observacao, created_at, updated_at, created_by) values (${q(l.item.id)}, 'producao', ${l.qtd}, ${q(pid)}, ${q(`Produção nº ${i + 1}`)}, ${q(ts)}, ${q(ts)}, ${q(SECRETARIA)});`
    )
  })
  ls.push(
    `insert into public.estoque_toras_mov (especie_id, tipo, quantidade, unidade, producao_id, created_at, updated_at, created_by) values ((select id from public.especies where nome = ${q(especie)}), 'consumo', ${q(paraNumeric(-toras, 6))}, 'm3', ${q(pid)}, ${q(ts)}, ${q(ts)}, ${q(SECRETARIA)});`
  )
  evento(quando, ls)
  producoesGeradas.push({ ts: quando, itens: linhasProd })
}

/** Saldo de um item numa data, considerando produções até ali e o que já foi baixado. */
const baixado = new Map<string, number>()
function disponivel(itemId: string, ate: number) {
  let s = 0
  for (const p of producoesGeradas)
    if (p.ts <= ate) for (const l of p.itens) if (l.item.id === itemId) s += l.qtd
  return s - (baixado.get(itemId) ?? 0)
}

// ajustes de inventário (perdas e quebras)
let nAjuste = 0
for (const item of [...itensEstoque.values()].filter((_, k) => k % 4 === 1)) {
  const quando = fim - ++nAjuste * 5 * 86_400_000
  const qtd = Math.min(5 + Math.floor(r() * 25), Math.max(0, disponivel(item.id, quando)))
  if (qtd <= 0) continue
  baixado.set(item.id, (baixado.get(item.id) ?? 0) + qtd)
  const ts = new Date(quando).toISOString()
  evento(quando, [
    `insert into public.estoque_mov (estoque_item_id, tipo, quantidade, motivo, observacao, created_at, updated_at, created_by) values (${q(item.id)}, 'ajuste', ${-qtd}, ${q(escolher(["quebra", "perda", "inventario"]))}, 'Contagem de pátio (exemplo)', ${q(ts)}, ${q(ts)}, ${q(SECRETARIA)});`,
  ])
}

// vendas
const precoVenda = (especie: string, ordem: number) =>
  (especie === "Pinus" ? 1200 : 1100) - (ordem - 1) * 200
const N_VENDAS = 28
const inicioVendas = new Date("2026-07-10T09:00:00-03:00").getTime()
for (let i = 0; i < N_VENDAS; i++) {
  const quando =
    inicioVendas +
    ((fim + 20 * 3600_000 - inicioVendas) * i) / (N_VENDAS - 1) +
    Math.floor(r() * 5) * 3600_000
  const idade = (fim - quando) / 86_400_000
  const status =
    i === N_VENDAS - 1 || i === N_VENDAS - 4
      ? "rascunho"
      : i === N_VENDAS - 6
        ? "cancelada"
        : idade > 6
          ? "entregue"
          : "confirmada"
  const ci = Math.floor(r() * clientes.length)
  const cliente = clientes[ci]!
  const vi = Math.floor(r() * veiculos.length)
  const veiculo = veiculos[vi]!
  const candidatos = [...itensEstoque.values()].filter((it) => disponivel(it.id, quando) >= 40)
  if (!candidatos.length) continue
  const escolhidos = [
    ...new Set(Array.from({ length: 1 + Math.floor(r() * 3) }, () => escolher(candidatos))),
  ]
  const itens = escolhidos.map((it) => {
    const disp = disponivel(it.id, quando)
    const qtd = Math.max(10, Math.min(disp, Math.round((disp * (0.15 + r() * 0.3)) / 10) * 10))
    return { it, qtd, preco: precoVenda(it.especie, it.ordem) }
  })
  const frete = escolher(["cif", "cif", "fob", "sem_frete"] as const)
  const valorFrete = frete === "cif" ? 350 + Math.round(r() * 8) * 50 : 0
  const calc = calcularVenda(
    itens.map((x) => ({
      espessuraCm: x.it.b[0],
      larguraCm: x.it.b[1],
      comprimentoM: x.it.b[2],
      quantidade: x.qtd,
      precoM3: x.preco,
    })),
    valorFrete,
    0
  )
  const vid = id("8", i + 1)
  const ts = new Date(quando).toISOString()
  const confirmada = status !== "rascunho"
  const tsConf = new Date(quando + 2 * 3600_000).toISOString()
  const tsEntregue = new Date(quando + 26 * 3600_000).toISOString()
  const tsCancel = new Date(quando + 5 * 3600_000).toISOString()
  const ls = [
    `insert into public.vendas (id, cliente_id, motorista_id, veiculo_id, placa, destino_cep, destino_logradouro, destino_numero, destino_bairro, destino_municipio, destino_codigo_ibge, destino_uf, tipo_frete, valor_frete, desconto, total_pecas, total_m3, valor_produtos, valor_total, status, confirmada_em, entregue_em, cancelada_em, motivo_cancelamento, created_at, updated_at, created_by) values (${q(vid)}, ${q(id("2", ci + 1))}, ${q(id("3", veiculo.mot))}, ${q(id("4", vi + 1))}, ${q(veiculo.placa)}, ${q(cliente.cep)}, ${q(cliente.log)}, ${q(cliente.num)}, ${q(cliente.bairro)}, ${q(cliente.mun)}, ${q(cliente.ibge)}, ${q(cliente.uf)}, ${q(frete)}, ${valorFrete}, 0, ${calc.totalPecas}, ${q(paraNumeric(calc.totalM3, 6))}, ${q(paraNumeric(calc.valorProdutos, 2))}, ${q(paraNumeric(calc.valorTotal, 2))}, ${q(status)}, ${confirmada ? q(tsConf) : "null"}, ${status === "entregue" ? q(tsEntregue) : "null"}, ${status === "cancelada" ? q(tsCancel) : "null"}, ${status === "cancelada" ? q("Cliente desistiu da carga (exemplo)") : "null"}, ${q(ts)}, ${q(ts)}, ${q(SECRETARIA)});`,
  ]
  itens.forEach((x, k) => {
    const desc = descricaoItem({
      especie: x.it.especie,
      qualidade: `${x.it.ordem}ª linha`,
      espessuraCm: x.it.b[0],
      larguraCm: x.it.b[1],
      comprimentoM: x.it.b[2],
    })
    ls.push(
      `insert into public.vendas_itens (venda_id, estoque_item_id, descricao, quantidade, volume_m3, preco_m3, valor_total, created_at, updated_at, created_by) values (${q(vid)}, ${q(x.it.id)}, ${q(desc)}, ${x.qtd}, ${q(paraNumeric(calc.linhas[k]!.volumeM3, 6))}, ${x.preco}, ${q(paraNumeric(calc.linhas[k]!.valor, 2))}, ${q(ts)}, ${q(ts)}, ${q(SECRETARIA)});`
    )
  })
  evento(quando, ls)

  if (confirmada) {
    const conf = [
      `insert into public.romaneios (venda_id, emitido_em, created_at, updated_at, created_by) values (${q(vid)}, ${q(tsConf)}, ${q(tsConf)}, ${q(tsConf)}, ${q(SECRETARIA)});`,
    ]
    for (const x of itens) {
      baixado.set(x.it.id, (baixado.get(x.it.id) ?? 0) + x.qtd)
      conf.push(
        `insert into public.estoque_mov (estoque_item_id, tipo, quantidade, venda_id, observacao, created_at, updated_at, created_by) values (${q(x.it.id)}, 'venda', ${-x.qtd}, ${q(vid)}, ${q(`Venda nº ${i + 1}`)}, ${q(tsConf)}, ${q(tsConf)}, ${q(SECRETARIA)});`
      )
    }
    evento(quando + 2 * 3600_000, conf)
    if (status === "cancelada") {
      evento(
        quando + 5 * 3600_000,
        itens.map((x) => {
          baixado.set(x.it.id, (baixado.get(x.it.id) ?? 0) - x.qtd)
          return `insert into public.estoque_mov (estoque_item_id, tipo, quantidade, venda_id, observacao, created_at, updated_at, created_by) values (${q(x.it.id)}, 'estorno_venda', ${x.qtd}, ${q(vid)}, 'Cancelamento da venda (exemplo)', ${q(tsCancel)}, ${q(tsCancel)}, ${q(SECRETARIA)});`
        })
      )
    }
  }
}

eventos.sort((a, b) => a.ts - b.ts)
for (const e of eventos) for (const l of e.linhas) sql(l)
for (const t of TABELAS_HIST) sql(`alter table public.${t} enable trigger carimbo;`)

writeFileSync(
  new URL("../supabase/seeds/dados_exemplo.sql", import.meta.url),
  linhas.join("\n") + "\n"
)
console.log(`dados_exemplo.sql gerado (${linhas.length} linhas)`)
