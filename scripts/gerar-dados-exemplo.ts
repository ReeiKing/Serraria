/**
 * Gera supabase/seeds/dados_exemplo.sql — dados fictícios para analisar o sistema.
 * Usa as mesmas funções de cálculo da aplicação. Rode: npx tsx scripts/gerar-dados-exemplo.ts
 */
import { writeFileSync } from "node:fs"

import { paraNumeric } from "../src/lib/calculos"
import { calcularEntrada, type DadosMedicao } from "../src/lib/entradas"
import { calcularProducao } from "../src/lib/producao"
import { calcularVenda, descricaoItem, descricaoProduto } from "../src/lib/vendas"

const SECRETARIA = "00000000-0000-0000-0000-000000000001"

// pseudo-aleatório determinístico
let semente = 2026
const r = () => ((semente = (semente * 16807) % 2147483647) - 1) / 2147483646
const escolher = <T>(lista: T[]) => lista[Math.floor(r() * lista.length)]!
const id = (prefixo: string, n: number) =>
  `${prefixo}0000000-0000-0000-0000-${String(n).padStart(12, "0")}`
/**
 * Datas relativas: os dados são gerados como se "agora" fosse AGORA_REF, mas o SQL grava
 * `now() - intervalo`. Assim o sistema parece em uso até poucas horas antes da apresentação,
 * em qualquer dia em que o banco for recriado.
 */
const AGORA_REF = new Date("2026-10-06T16:00:00-03:00").getTime()
const atras = (ms: number) =>
  `interval '${Math.max(0, Math.round((AGORA_REF - ms) / 1000))} seconds'`
const tsql = (ms: number) => `(now() - ${atras(ms)})`
const dsql = (ms: number) => `((now() - ${atras(ms)}) at time zone 'America/Sao_Paulo')::date`
const GERENTE = "00000000-0000-0000-0000-000000000002"

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
  {
    nome: "Agroflorestal Imbituva Ltda",
    doc: dvCnpj("161803390001"),
    mun: "Imbituva",
    uf: "PR",
    tel: "42999110005",
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
  {
    razao: "Telhados & Estruturas Guarapuava Ltda",
    fantasia: "TelhaForte",
    doc: dvCnpj("334455660001"),
    ie: "9056781234",
    ind: 1,
    mun: "Guarapuava",
    ibge: "4109401",
    uf: "PR",
    cep: "85010000",
    log: "Rua Saldanha Marinho",
    num: "1500",
    bairro: "Centro",
  },
  {
    razao: "Embalagens Norte Paraná Ltda",
    fantasia: "EmbalaNorte",
    doc: dvCnpj("445566770001"),
    ie: "9034567812",
    ind: 1,
    mun: "Londrina",
    ibge: "4113700",
    uf: "PR",
    cep: "86010000",
    log: "Av. Higienópolis",
    num: "300",
    bairro: "Centro",
  },
  {
    razao: "Madeiras Serra Catarinense Ltda",
    fantasia: "Serra Madeiras",
    doc: dvCnpj("556677880001"),
    ie: "2587413690",
    ind: 1,
    mun: "Lages",
    ibge: "4209300",
    uf: "SC",
    cep: "88501000",
    log: "Av. Marechal Floriano",
    num: "720",
    bairro: "Centro",
  },
  {
    razao: "Construtora Campos Gerais Ltda",
    fantasia: "CG Obras",
    doc: dvCnpj("667788990001"),
    ie: "9078123456",
    ind: 1,
    mun: "Telêmaco Borba",
    ibge: "4127106",
    uf: "PR",
    cep: "84261000",
    log: "Av. Chanceler Horácio Lafer",
    num: "640",
    bairro: "Centro",
  },
  {
    razao: "Hortifrúti Campos Gerais Ltda",
    fantasia: "Hortifrúti CG",
    doc: dvCnpj("778899000001"),
    ie: "9011223344",
    ind: 1,
    mun: "Ponta Grossa",
    ibge: "4119905",
    uf: "PR",
    cep: "84015000",
    log: "Rua Comendador Miró",
    num: "980",
    bairro: "Centro",
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
  { nome: "José Aparecido Rocha", cpf: dvCpf("741852963"), cnh: "07418529630", tel: "42988770004" },
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
  { placa: "RTY5G67", tipo: "toco", tara: 7200, uf: "PR", mot: 4 },
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
sql("alter table public.entradas_toras_itens disable trigger carimbo;")
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
  const ts = tsql(quando.getTime())
  const autor = r() < 0.3 ? GERENTE : SECRETARIA
  const n = (x: unknown, casas: number) =>
    x === undefined ? "null" : q(paraNumeric(x as number, casas))

  sql(
    `insert into public.entradas_toras (id, especie_id, fornecedor_id, motorista_id, veiculo_id, placa, origem, municipio_origem, uf_origem, modo_medicao, carga_comprimento_m, carga_largura_m, carga_altura_m, peso_bruto_kg, tara_kg, peso_liquido_kg, quantidade, unidade, valor_unitario, valor_total, created_at, updated_at, created_by) values (${q(eid)}, (select id from public.especies where nome = ${q(especie)}), ${q(fornecedor)}, ${q(id("3", v.mot))}, ${q(id("4", veiculo + 1))}, ${q(v.placa)}, ${q(`Talhão ${1 + Math.floor(r() * 12)}`)}, ${q(fornecedores[0]!.mun)}, 'PR', ${q(modo)}, ${n(dados.cargaComprimentoM, 3)}, ${n(dados.cargaLarguraM, 3)}, ${n(dados.cargaAlturaM, 3)}, ${n(dados.pesoBrutoKg, 2)}, ${n(dados.taraKg, 2)}, ${c.pesoLiquidoKg === null ? "null" : q(paraNumeric(c.pesoLiquidoKg, 2))}, ${q(paraNumeric(c.quantidade, 6))}, ${q(c.unidade)}, ${q(paraNumeric(preco, 2))}, ${q(paraNumeric(c.valorTotal, 2))}, ${ts}, ${ts}, ${q(autor)});`
  )
  for (const t of c.toras) {
    sql(
      `insert into public.entradas_toras_itens (entrada_id, diametro_cm, comprimento_m, quantidade, volume_m3, created_at, updated_at, created_by) values (${q(eid)}, ${t.diametroCm}, ${t.comprimentoM}, ${t.quantidade}, ${q(paraNumeric(t.volumeM3, 6))}, ${ts}, ${ts}, ${q(SECRETARIA)});`
    )
  }
  sql(
    `insert into public.estoque_toras_mov (especie_id, tipo, quantidade, unidade, entrada_id, created_at, updated_at, created_by) values ((select id from public.especies where nome = ${q(especie)}), 'compra', ${q(paraNumeric(c.quantidade, 6))}, ${q(c.unidade)}, ${q(eid)}, ${ts}, ${ts}, ${q(SECRETARIA)});`
  )

  // pagamentos: antigas quitadas, intermediárias parciais, recentes pendentes
  const idade = (fim - quando.getTime()) / 86_400_000
  const pago =
    idade > 45
      ? c.valorTotal
      : idade > 15
        ? Math.round(c.valorTotal * 0.5 * 100) / 100
        : idade > 4
          ? Math.round(c.valorTotal * 0.3 * 100) / 100
          : 0
  if (pago > 0) {
    const quandoPag = Math.min(quando.getTime() + 10 * 86_400_000, AGORA_REF - 86_400_000)
    const dataPag = dsql(quandoPag)
    sql(
      `insert into public.entradas_toras_pagamentos (entrada_id, data_pagamento, valor, forma, created_at, updated_at, created_by) values (${q(eid)}, ${dataPag}, ${q(paraNumeric(pago, 2))}, ${q(escolher(["pix", "transferencia", "boleto"]))}, ${ts}, ${ts}, ${q(SECRETARIA)});`
    )
  }
}

sql("alter table public.entradas_toras enable trigger carimbo;")
sql("alter table public.estoque_toras_mov enable trigger carimbo;")
sql("alter table public.entradas_toras_itens enable trigger carimbo;")
sql("alter table public.entradas_toras_pagamentos enable trigger carimbo;")

// ---------------------------------------------------------------- produção, estoque e vendas
// Eventos com data: são ordenados antes de gerar o SQL, para o saldo do kardex
// (calculado pelo gatilho na ordem de inserção) seguir a ordem cronológica.
sql("")
sql("-- @@ PRODUCAO @@")
const TABELAS_HIST = [
  "produtos",
  "producoes_produtos",
  "producoes_produtos_itens",
  "produtos_mov",
  "producoes",
  "producoes_itens",
  "estoque_mov",
  "estoque_itens",
  "vendas",
  "vendas_itens",
  "romaneios",
  "estoque_toras_mov",
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
      `insert into public.estoque_itens (id, especie_id, qualidade_id, espessura_cm, largura_cm, comprimento_m, estoque_minimo_pecas, created_at, updated_at, created_by) values (${q(item.id)}, (select id from public.especies where nome = ${q(especie)}), (select id from public.qualidades where ordem = ${ordemQualidade}), ${b[0]}, ${b[1]}, ${b[2]}, ${minimo}, ${tsql(inicio)}, ${tsql(inicio)}, ${q(SECRETARIA)});`
    )
  }
  return item
}

// produções
const N_PROD = 22
const producoesGeradas: { ts: number; itens: { item: Item; qtd: number }[] }[] = []
for (let i = 0; i < N_PROD; i++) {
  const quando = inicio + 3 * 86_400_000 + ((fim - inicio - 3 * 86_400_000) * i) / (N_PROD - 1)
  const ts = tsql(quando)
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
    `insert into public.producoes (id, data_producao, especie_id, toras_consumidas_m3, volume_serrado_m3, total_pecas, rendimento_percentual, created_at, updated_at, created_by) values (${q(pid)}, ${dsql(quando)}, (select id from public.especies where nome = ${q(especie)}), ${q(paraNumeric(toras, 6))}, ${q(paraNumeric(calc.volumeSerradoM3, 6))}, ${calc.totalPecas}, ${q(paraNumeric(rend, 3))}, ${ts}, ${ts}, ${q(SECRETARIA)});`,
  ]
  linhasProd.forEach((l, k) => {
    ls.push(
      `insert into public.producoes_itens (producao_id, estoque_item_id, quantidade, volume_peca_m3, volume_total_m3, created_at, updated_at, created_by) values (${q(pid)}, ${q(l.item.id)}, ${l.qtd}, ${q(paraNumeric(calc.linhas[k]!.volumePecaM3, 6))}, ${q(paraNumeric(calc.linhas[k]!.volumeTotalM3, 6))}, ${ts}, ${ts}, ${q(SECRETARIA)});`,
      `insert into public.estoque_mov (estoque_item_id, tipo, quantidade, producao_id, observacao, created_at, updated_at, created_by) values (${q(l.item.id)}, 'producao', ${l.qtd}, ${q(pid)}, ${q(`Produção nº ${i + 1}`)}, ${ts}, ${ts}, ${q(SECRETARIA)});`
    )
  })
  ls.push(
    `insert into public.estoque_toras_mov (especie_id, tipo, quantidade, unidade, producao_id, created_at, updated_at, created_by) values ((select id from public.especies where nome = ${q(especie)}), 'consumo', ${q(paraNumeric(-toras, 6))}, 'm3', ${q(pid)}, ${ts}, ${ts}, ${q(SECRETARIA)});`
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
  const ts = tsql(quando)
  evento(quando, [
    `insert into public.estoque_mov (estoque_item_id, tipo, quantidade, motivo, observacao, created_at, updated_at, created_by) values (${q(item.id)}, 'ajuste', ${-qtd}, ${q(escolher(["quebra", "perda", "inventario"]))}, 'Contagem de pátio (exemplo)', ${ts}, ${ts}, ${q(SECRETARIA)});`,
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
      preco: x.preco,
    })),
    valorFrete,
    0
  )
  const vid = id("8", i + 1)
  const ts = tsql(quando)
  const confirmada = status !== "rascunho"
  const autorVenda = r() < 0.3 ? GERENTE : SECRETARIA
  const tsConf = tsql(quando + 2 * 3600_000)
  const tsEntregue = tsql(Math.min(quando + 26 * 3600_000, AGORA_REF - 3600_000))
  const tsCancel = tsql(quando + 5 * 3600_000)
  const ls = [
    `insert into public.vendas (id, cliente_id, motorista_id, veiculo_id, placa, destino_cep, destino_logradouro, destino_numero, destino_bairro, destino_municipio, destino_codigo_ibge, destino_uf, tipo_frete, valor_frete, desconto, total_pecas, total_m3, valor_produtos, valor_total, status, confirmada_em, entregue_em, cancelada_em, motivo_cancelamento, created_at, updated_at, created_by) values (${q(vid)}, ${q(id("2", ci + 1))}, ${q(id("3", veiculo.mot))}, ${q(id("4", vi + 1))}, ${q(veiculo.placa)}, ${q(cliente.cep)}, ${q(cliente.log)}, ${q(cliente.num)}, ${q(cliente.bairro)}, ${q(cliente.mun)}, ${q(cliente.ibge)}, ${q(cliente.uf)}, ${q(frete)}, ${valorFrete}, 0, ${calc.totalPecas}, ${q(paraNumeric(calc.totalM3, 6))}, ${q(paraNumeric(calc.valorProdutos, 2))}, ${q(paraNumeric(calc.valorTotal, 2))}, ${q(status)}, ${confirmada ? tsConf : "null"}, ${status === "entregue" ? tsEntregue : "null"}, ${status === "cancelada" ? tsCancel : "null"}, ${status === "cancelada" ? q("Cliente desistiu da carga (exemplo)") : "null"}, ${ts}, ${ts}, ${q(autorVenda)});`,
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
      `insert into public.vendas_itens (venda_id, estoque_item_id, descricao, quantidade, volume_m3, preco_m3, valor_total, created_at, updated_at, created_by) values (${q(vid)}, ${q(x.it.id)}, ${q(desc)}, ${x.qtd}, ${q(paraNumeric(calc.linhas[k]!.volumeM3, 6))}, ${x.preco}, ${q(paraNumeric(calc.linhas[k]!.valor, 2))}, ${ts}, ${ts}, ${q(SECRETARIA)});`
    )
  })
  evento(quando, ls)

  if (confirmada) {
    const conf = [
      `insert into public.romaneios (venda_id, emitido_em, created_at, updated_at, created_by) values (${q(vid)}, ${tsConf}, ${tsConf}, ${tsConf}, ${q(SECRETARIA)});`,
    ]
    for (const x of itens) {
      baixado.set(x.it.id, (baixado.get(x.it.id) ?? 0) + x.qtd)
      conf.push(
        `insert into public.estoque_mov (estoque_item_id, tipo, quantidade, venda_id, observacao, created_at, updated_at, created_by) values (${q(x.it.id)}, 'venda', ${-x.qtd}, ${q(vid)}, ${q(`Venda nº ${i + 1}`)}, ${tsConf}, ${tsConf}, ${q(SECRETARIA)});`
      )
    }
    evento(quando + 2 * 3600_000, conf)
    if (status === "cancelada") {
      evento(
        quando + 5 * 3600_000,
        itens.map((x) => {
          baixado.set(x.it.id, (baixado.get(x.it.id) ?? 0) - x.qtd)
          return `insert into public.estoque_mov (estoque_item_id, tipo, quantidade, venda_id, observacao, created_at, updated_at, created_by) values (${q(x.it.id)}, 'estorno_venda', ${x.qtd}, ${q(vid)}, 'Cancelamento da venda (exemplo)', ${tsCancel}, ${tsCancel}, ${q(SECRETARIA)});`
        })
      )
    }
  }
}

// ---------------------------------------------------------------- paletes e caixotes (vendidos por unidade)
const PRODUTOS = [
  {
    nome: "Palete PBR",
    categoria: "palete",
    dimensoes: "1,00 × 1,20 m",
    preco: 72,
    ncm: "44152000",
    minimo: 30,
    lote: [20, 60],
    especie: "Pinus",
    desc: "Padrão PBR, 4 entradas",
  },
  {
    nome: "Palete descartável",
    categoria: "palete",
    dimensoes: "1,00 × 1,20 m",
    preco: 28.5,
    ncm: "44152000",
    minimo: 50,
    lote: [40, 120],
    especie: "Pinus",
    desc: "Uso único, para envio sem retorno",
  },
  {
    nome: "Caixote de feira",
    categoria: "caixote",
    dimensoes: "Padrão hortifrúti",
    preco: 6.8,
    ncm: "44151000",
    minimo: 200,
    lote: [150, 400],
    especie: "Eucalipto",
    desc: "Caixote de madeira para frutas e legumes",
  },
]
PRODUTOS.forEach((p, k) =>
  sql(
    `insert into public.produtos (id, nome, categoria, descricao, dimensoes, especie_id, ncm, preco_venda, estoque_minimo, created_at, updated_at, created_by) values (${q(id("9", k + 1))}, ${q(p.nome)}, ${q(p.categoria)}, ${q(p.desc)}, ${q(p.dimensoes)}, (select id from public.especies where nome = ${q(p.especie)}), ${q(p.ncm)}, ${p.preco}, ${p.minimo}, ${tsql(inicio)}, ${tsql(inicio)}, ${q(SECRETARIA)});`
  )
)
const montado: { ts: number; k: number; qtd: number }[] = []
const vendidoProd = new Map<number, number>()
const dispProduto = (k: number, ate: number) =>
  montado.filter((m) => m.k === k && m.ts <= ate).reduce((a, m) => a + m.qtd, 0) -
  (vendidoProd.get(k) ?? 0)

const N_MONT = 18
for (let i = 0; i < N_MONT; i++) {
  const quando =
    inicio + 2 * 86_400_000 + ((fim - inicio - 2 * 86_400_000) * i) / (N_MONT - 1) + 9 * 3600_000
  const ts = tsql(quando)
  const mid = id("a", i + 1)
  const linhas = PRODUTOS.map((p, k) => ({
    k,
    qtd: Math.round((p.lote[0]! + r() * (p.lote[1]! - p.lote[0]!)) / 10) * 10,
  })).filter((_, k) => k === 2 || r() < 0.75)
  const ls = [
    `insert into public.producoes_produtos (id, data_producao, total_unidades, created_at, updated_at, created_by) values (${q(mid)}, ${dsql(quando)}, ${linhas.reduce((a, l) => a + l.qtd, 0)}, ${ts}, ${ts}, ${q(SECRETARIA)});`,
  ]
  for (const l of linhas) {
    montado.push({ ts: quando, k: l.k, qtd: l.qtd })
    ls.push(
      `insert into public.producoes_produtos_itens (producao_id, produto_id, quantidade, created_at, updated_at, created_by) values (${q(mid)}, ${q(id("9", l.k + 1))}, ${l.qtd}, ${ts}, ${ts}, ${q(SECRETARIA)});`,
      `insert into public.produtos_mov (produto_id, tipo, quantidade, producao_id, observacao, created_at, updated_at, created_by) values (${q(id("9", l.k + 1))}, 'producao', ${l.qtd}, ${q(mid)}, ${q(`Montagem nº ${i + 1}`)}, ${ts}, ${ts}, ${q(SECRETARIA)});`
    )
  }
  evento(quando, ls)
}

// vendas de produtos: paletes para a fábrica de paletes e a indústria de embalagens; caixotes para o hortifrúti
const COMPRADORES: { cliente: number; produtos: number[] }[] = [
  { cliente: 2, produtos: [0, 1] }, // Paletes Sul
  { cliente: 5, produtos: [1] }, // Embalagens Norte Paraná
  { cliente: clientes.length - 1, produtos: [2] }, // Hortifrúti CG
  { cliente: 1, produtos: [0] }, // Marcenaria Bom Lar
]
const N_VENDAS_PROD = 16
const inicioProd = inicio + 8 * 86_400_000
for (let i = 0; i < N_VENDAS_PROD; i++) {
  const quando =
    inicioProd + ((fim + 18 * 3600_000 - inicioProd) * i) / (N_VENDAS_PROD - 1) + 14 * 3600_000
  const comprador = COMPRADORES[i % COMPRADORES.length]!
  const ci = comprador.cliente
  const cliente = clientes[ci]!
  const itensP = comprador.produtos
    .map((k) => {
      const disp = dispProduto(k, quando)
      const qtd = Math.min(disp, Math.round((disp * (0.35 + r() * 0.35)) / 10) * 10)
      return { k, qtd }
    })
    .filter((x) => x.qtd >= 10)
  if (!itensP.length) continue
  const idade = (fim - quando) / 86_400_000
  const status = i === N_VENDAS_PROD - 1 ? "rascunho" : idade > 5 ? "entregue" : "confirmada"
  const confirmada = status !== "rascunho"
  const calc = calcularVenda(
    itensP.map((x) => ({ unidade: "UN" as const, quantidade: x.qtd, preco: PRODUTOS[x.k]!.preco }))
  )
  const vi = Math.floor(r() * veiculos.length)
  const veiculo = veiculos[vi]!
  const vid = id("8", 100 + i)
  const ts = tsql(quando)
  const tsConf = tsql(quando + 90 * 60_000)
  const tsEntregue = tsql(Math.min(quando + 20 * 3600_000, AGORA_REF - 3600_000))
  const ls = [
    `insert into public.vendas (id, cliente_id, motorista_id, veiculo_id, placa, destino_cep, destino_logradouro, destino_numero, destino_bairro, destino_municipio, destino_codigo_ibge, destino_uf, tipo_frete, valor_frete, desconto, total_pecas, total_unidades, total_m3, valor_produtos, valor_total, status, confirmada_em, entregue_em, created_at, updated_at, created_by) values (${q(vid)}, ${q(id("2", ci + 1))}, ${q(id("3", veiculo.mot))}, ${q(id("4", vi + 1))}, ${q(veiculo.placa)}, ${q(cliente.cep)}, ${q(cliente.log)}, ${q(cliente.num)}, ${q(cliente.bairro)}, ${q(cliente.mun)}, ${q(cliente.ibge)}, ${q(cliente.uf)}, 'fob', 0, 0, 0, ${calc.totalUnidades}, 0, ${q(paraNumeric(calc.valorProdutos, 2))}, ${q(paraNumeric(calc.valorTotal, 2))}, ${q(status)}, ${confirmada ? tsConf : "null"}, ${status === "entregue" ? tsEntregue : "null"}, ${ts}, ${ts}, ${q(SECRETARIA)});`,
  ]
  itensP.forEach((x, k) => {
    const p = PRODUTOS[x.k]!
    ls.push(
      `insert into public.vendas_itens (venda_id, produto_id, unidade, descricao, quantidade, volume_m3, preco_unitario, valor_total, created_at, updated_at, created_by) values (${q(vid)}, ${q(id("9", x.k + 1))}, 'UN', ${q(descricaoProduto({ nome: p.nome, dimensoes: p.dimensoes }))}, ${x.qtd}, 0, ${p.preco}, ${q(paraNumeric(calc.linhas[k]!.valor, 2))}, ${ts}, ${ts}, ${q(SECRETARIA)});`
    )
  })
  evento(quando, ls)
  if (confirmada) {
    const conf = [
      `insert into public.romaneios (venda_id, emitido_em, created_at, updated_at, created_by) values (${q(vid)}, ${tsConf}, ${tsConf}, ${tsConf}, ${q(SECRETARIA)});`,
    ]
    for (const x of itensP) {
      vendidoProd.set(x.k, (vendidoProd.get(x.k) ?? 0) + x.qtd)
      conf.push(
        `insert into public.produtos_mov (produto_id, tipo, quantidade, venda_id, observacao, created_at, updated_at, created_by) values (${q(id("9", x.k + 1))}, 'venda', ${-x.qtd}, ${q(vid)}, 'Venda de produtos', ${tsConf}, ${tsConf}, ${q(SECRETARIA)});`
      )
    }
    evento(quando + 90 * 60_000, conf)
  }
}

eventos.sort((a, b) => a.ts - b.ts)
for (const e of eventos) for (const l of e.linhas) sql(l)
for (const t of TABELAS_HIST) sql(`alter table public.${t} enable trigger carimbo;`)

// ---------------------------------------------------------------- histórico de preços
sql("")
sql("-- Preços: os do seed passam a valer há 20 dias; entram dois reajustes anteriores.")
sql("alter table public.tabela_precos disable trigger carimbo;")
sql(
  `update public.tabela_precos set vigencia_inicio = ${dsql(AGORA_REF - 20 * 86_400_000)}, created_at = ${tsql(AGORA_REF - 20 * 86_400_000)}, updated_at = ${tsql(AGORA_REF - 20 * 86_400_000)}, created_by = ${q(GERENTE)};`
)
for (const [dias, fator] of [
  [110, 0.9],
  [60, 0.95],
] as const) {
  sql(
    `insert into public.tabela_precos (tipo, especie_id, qualidade_id, unidade, valor, vigencia_inicio, observacao, created_at, updated_at, created_by) select tipo, especie_id, qualidade_id, unidade, round(valor * ${fator}, 0), ${dsql(AGORA_REF - dias * 86_400_000)}, 'Tabela anterior', ${tsql(AGORA_REF - dias * 86_400_000)}, ${tsql(AGORA_REF - dias * 86_400_000)}, ${q(GERENTE)} from public.tabela_precos where observacao is null;`
  )
}
sql("alter table public.tabela_precos enable trigger carimbo;")

// ---------------------------------------------------------------- orçamentos do site
const ORCAMENTOS: [string, string, string, string, string, number, string][] = [
  [
    "Ricardo Almeida",
    "41998761234",
    "Curitiba",
    "Pinus serrado",
    "Preciso de 8 m³ de pinus 2,5 x 30 x 3,00 para formas. Entrega na obra.",
    0.2,
    "novo",
  ],
  [
    "Fernanda Souza",
    "42999123456",
    "Ponta Grossa",
    "Tábuas",
    "Orçamento de 200 tábuas 2,5 x 15 x 3,00, 2ª linha.",
    0.6,
    "novo",
  ],
  [
    "Luiz Henrique Prado",
    "43991234567",
    "Londrina",
    "Medida sob encomenda",
    "Vocês serram 4 x 20 x 4,00 em eucalipto? Quantidade 3 m³.",
    1.3,
    "novo",
  ],
  [
    "Pallets Rápido Ltda",
    "47988776655",
    "Joinville",
    "Pinus serrado",
    "Compramos 20 m³/mês de pinus 1,8 x 9 x 1,20 para paletes. Gostaria de uma proposta mensal.",
    2.1,
    "novo",
  ],
  [
    "Marina Costa",
    "42988112233",
    "Castro",
    "Vigas e caibros",
    "Telhado de 120 m², preciso de lista de vigas e caibros de eucalipto.",
    3.5,
    "em_atendimento",
  ],
  [
    "Construtora Ideal",
    "41997654321",
    "São José dos Pinhais",
    "Pinus serrado",
    "Cotação de 15 m³ de pinus 5 x 10 x 3,00.",
    5,
    "em_atendimento",
  ],
  [
    "André Martins",
    "42999887766",
    "Carambeí",
    "Eucalipto serrado",
    "Eucalipto 6 x 16 para estrutura de barracão.",
    6.2,
    "em_atendimento",
  ],
  [
    "Sítio Bela Vista",
    "42998765432",
    "Palmeira",
    "Outro",
    "Mourões e tábuas para cerca, uns 2 m³.",
    8,
    "concluido",
  ],
  [
    "Marcenaria Arte Viva",
    "41996543210",
    "Curitiba",
    "Tábuas",
    "Pinus 1ª linha 2,5 x 30 para móveis, 4 m³.",
    10.4,
    "concluido",
  ],
  [
    "Gabriel Ferreira",
    "42997651234",
    "Ponta Grossa",
    "Vigas e caibros",
    "Caibros 5 x 5 x 3,00, 300 peças.",
    12,
    "concluido",
  ],
  [
    "Obras & Reformas PG",
    "42991239876",
    "Ponta Grossa",
    "Pinus serrado",
    "Formas e escoramento para laje, 10 m³.",
    14.6,
    "concluido",
  ],
  [
    "Patrícia Gomes",
    "42995554433",
    "Tibagi",
    "Eucalipto serrado",
    "Preço do m³ de eucalipto 3ª linha.",
    16,
    "concluido",
  ],
  ["Teste", "11999999999", "", "", "teste teste", 18, "descartado"],
  [
    "Roberto Silva",
    "43988880000",
    "Apucarana",
    "Pinus serrado",
    "Frete para Apucarana? 2 m³ apenas.",
    19.5,
    "descartado",
  ],
]
sql("alter table public.orcamentos_site disable trigger carimbo;")
for (const [nome, tel, cidade, produto, msg, diasAtras, status] of ORCAMENTOS) {
  const t = tsql(AGORA_REF - diasAtras * 86_400_000)
  const email = `${nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z ]/g, "")
    .trim()
    .replace(/ +/g, ".")}@exemplo.com.br`
  sql(
    `insert into public.orcamentos_site (nome, telefone, email, cidade, produto, mensagem, status, created_at, updated_at) values (${q(nome)}, ${q(tel)}, ${q(email)}, ${q(cidade || null)}, ${q(produto || null)}, ${q(msg)}, ${q(status)}, ${t}, ${t});`
  )
}
sql("alter table public.orcamentos_site enable trigger carimbo;")

// ---------------------------------------------------------------- usuários e auditoria
sql(`update public.usuarios set created_at = ${tsql(inicio - 10 * 86_400_000)};`)
sql("-- Auditoria com o usuário e a data de cada registro simulado")
sql(`update public.auditoria set
  usuario_id = coalesce(usuario_id, nullif(coalesce(dados_depois ->> 'created_by', dados_antes ->> 'created_by'), '')::uuid),
  created_at = coalesce((dados_depois ->> 'updated_at')::timestamptz, (dados_antes ->> 'updated_at')::timestamptz, created_at);`)

writeFileSync(
  new URL("../supabase/seeds/dados_exemplo.sql", import.meta.url),
  linhas.join("\n") + "\n"
)
console.log(`dados_exemplo.sql gerado (${linhas.length} linhas)`)
