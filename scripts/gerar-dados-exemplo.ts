/**
 * Gera supabase/seeds/dados_exemplo.sql — dados fictícios para analisar o sistema.
 * Usa as mesmas funções de cálculo da aplicação. Rode: npx tsx scripts/gerar-dados-exemplo.ts
 */
import { writeFileSync } from "node:fs"

import { paraNumeric } from "../src/lib/calculos"
import { calcularEntrada, type DadosMedicao } from "../src/lib/entradas"
import { calcularProducao } from "../src/lib/producao"

const SECRETARIA = "00000000-0000-0000-0000-000000000001"

// pseudo-aleatório determinístico
let semente = 2026
const r = () => ((semente = (semente * 16807) % 2147483647) - 1) / 2147483646
const escolher = <T>(lista: T[]) => lista[Math.floor(r() * lista.length)]!
const id = (prefixo: string, n: number) => `${prefixo}0000000-0000-0000-0000-${String(n).padStart(12, "0")}`
const q = (v: string | number | null) => (v === null ? "null" : typeof v === "number" ? String(v) : `'${v.replace(/'/g, "''")}'`)

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
    const pesos = b.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
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
  { nome: "Reflorestadora Campos Gerais Ltda", doc: dvCnpj("452187360001"), mun: "Ponta Grossa", uf: "PR", tel: "42999110001" },
  { nome: "Florestal Tibagi S.A.", doc: dvCnpj("308765120001"), mun: "Tibagi", uf: "PR", tel: "42999110002" },
  { nome: "Sítio Boa Vista (João Pereira)", doc: dvCpf("314159265"), mun: "Castro", uf: "PR", tel: "42999110003" },
  { nome: "Fazenda Santa Rita", doc: dvCnpj("271828180001"), mun: "Palmeira", uf: "PR", tel: "42999110004" },
]
fornecedores.forEach((f, i) =>
  sql(
    `insert into public.fornecedores (id, nome, documento, telefone, municipio, uf, created_by) values (${q(id("1", i + 1))}, ${q(f.nome)}, ${q(f.doc)}, ${q(f.tel)}, ${q(f.mun)}, ${q(f.uf)}, ${q(SECRETARIA)});`
  )
)

const clientes = [
  { razao: "Construtora Horizonte Ltda", fantasia: "Horizonte", doc: dvCnpj("112223330001"), ie: "9012345678", ind: 1, mun: "Curitiba", ibge: "4106902", uf: "PR", cep: "80010000", log: "Rua XV de Novembro", num: "1200", bairro: "Centro" },
  { razao: "Marcenaria Bom Lar Ltda", fantasia: "Bom Lar Móveis", doc: dvCnpj("114447770001"), ie: "9087654321", ind: 1, mun: "Ponta Grossa", ibge: "4119905", uf: "PR", cep: "84010000", log: "Av. Vicente Machado", num: "455", bairro: "Centro" },
  { razao: "Paletes Sul Indústria Ltda", fantasia: "Paletes Sul", doc: dvCnpj("223344550001"), ie: "2580369147", ind: 1, mun: "Joinville", ibge: "4209102", uf: "SC", cep: "89201000", log: "Rua do Príncipe", num: "88", bairro: "Centro" },
  { razao: "Carlos Eduardo Ramos", fantasia: "", doc: dvCpf("271828182"), ie: "", ind: 9, mun: "Castro", ibge: "4104907", uf: "PR", cep: "84165000", log: "Estrada da Colônia", num: "s/n", bairro: "Zona Rural" },
]
clientes.forEach((c, i) =>
  sql(
    `insert into public.clientes (id, razao_social, nome_fantasia, documento, ie, indicador_ie, email, telefone, cep, logradouro, numero, bairro, municipio, codigo_ibge, uf, created_by) values (${q(id("2", i + 1))}, ${q(c.razao)}, ${q(c.fantasia || null)}, ${q(c.doc)}, ${q(c.ie || null)}, ${c.ind}, ${q(`compras${i + 1}@exemplo.com.br`)}, ${q(`4199900${String(i).padStart(4, "0")}`)}, ${q(c.cep)}, ${q(c.log)}, ${q(c.num)}, ${q(c.bairro)}, ${q(c.mun)}, ${q(c.ibge)}, ${q(c.uf)}, ${q(SECRETARIA)});`
  )
)

const motoristas = [
  { nome: "Antônio Carlos da Silva", cpf: dvCpf("123456789"), cnh: "01234567890", tel: "42988770001" },
  { nome: "Marcos Vinícius Souza", cpf: dvCpf("987654321"), cnh: "09876543210", tel: "42988770002" },
  { nome: "Paulo Roberto Lima", cpf: dvCpf("456789123"), cnh: "04567891230", tel: "42988770003", transp: "Transportes Lima" },
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
  const quando = new Date(inicio + ((fim - inicio) * i) / (N_ENTRADAS - 1) + Math.floor(r() * 6) * 3600_000)
  const especie = r() < 0.6 ? "Pinus" : "Eucalipto"
  const modo = escolher(["m3", "m3", "estereo", "tonelada"] as const)
  const veiculo = Math.floor(r() * 3)
  const v = veiculos[veiculo]!
  const unidade = modo === "m3" ? "m3" : modo === "estereo" ? "st" : "t"
  const preco = precos[especie]![unidade]!

  const dados: DadosMedicao = { modoMedicao: modo, valorUnitario: preco }
  if (modo === "estereo") Object.assign(dados, { cargaComprimentoM: 7.2 + r() * 2, cargaLarguraM: 2.5, cargaAlturaM: 2.4 + r() * 0.5 })
  if (modo === "tonelada") Object.assign(dados, { pesoBrutoKg: Math.round(v.tara + 22000 + r() * 12000), taraKg: v.tara })
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
  const n = (x: unknown, casas: number) => (x === undefined ? "null" : q(paraNumeric(x as number, casas)))

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
  const pago = idade > 45 ? c.valorTotal : idade > 15 ? Math.round(c.valorTotal * 0.5 * 100) / 100 : 0
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

// ---------------------------------------------------------------- produção e estoque serrado
sql("")
sql("-- @@ PRODUCAO @@")
for (const t of ["producoes", "producoes_itens", "estoque_mov", "estoque_itens"]) sql(`alter table public.${t} disable trigger carimbo;`)

const BITOLAS: Record<string, [number, number, number][]> = {
  Pinus: [[2.5, 10, 3], [2.5, 15, 3], [2.5, 30, 3], [5, 5, 3], [5, 10, 3], [1.8, 9, 1.2]],
  Eucalipto: [[5, 15, 4], [6, 12, 4], [6, 16, 5], [2.5, 20, 3], [3, 15, 3]],
}
const itensEstoque = new Map<string, string>() // chave → id
let nItem = 0
function itemEstoque(especie: string, ordemQualidade: number, b: [number, number, number]) {
  const chave = `${especie}|${ordemQualidade}|${b.join("x")}`
  let iid = itensEstoque.get(chave)
  if (!iid) {
    iid = id("6", ++nItem)
    itensEstoque.set(chave, iid)
    // mínimo em algumas bitolas para mostrar o alerta de estoque baixo
    const minimo = ordemQualidade === 1 && nItem % 3 === 0 ? 400 : 0
    sql(
      `insert into public.estoque_itens (id, especie_id, qualidade_id, espessura_cm, largura_cm, comprimento_m, estoque_minimo_pecas, created_at, updated_at, created_by) values (${q(iid)}, (select id from public.especies where nome = ${q(especie)}), (select id from public.qualidades where ordem = ${ordemQualidade}), ${b[0]}, ${b[1]}, ${b[2]}, ${minimo}, '2026-07-01T12:00:00Z', '2026-07-01T12:00:00Z', ${q(SECRETARIA)});`
    )
  }
  return iid
}

const N_PROD = 22
for (let i = 0; i < N_PROD; i++) {
  const quando = new Date(inicio + 3 * 86_400_000 + ((fim - inicio - 3 * 86_400_000) * i) / (N_PROD - 1))
  const ts = quando.toISOString()
  const data = ts.slice(0, 10)
  const especie = i % 3 === 2 ? "Eucalipto" : "Pinus"
  const pid = id("7", i + 1)
  const linhasProd = Array.from({ length: 2 + Math.floor(r() * 3) }, () => {
    const b = escolher(BITOLAS[especie]!)
    const ordem = r() < 0.45 ? 1 : r() < 0.75 ? 2 : 3
    const vol = b[0] / 100 * (b[1] / 100) * b[2]
    const qtd = Math.max(20, Math.round((1.5 + r() * 3) / vol / 10) * 10)
    return { b, ordem, qtd }
  })
  const calc = calcularProducao(linhasProd.map((l) => ({ espessuraCm: l.b[0], larguraCm: l.b[1], comprimentoM: l.b[2], quantidade: l.qtd })))
  const toras = Math.round((calc.volumeSerradoM3 / (0.44 + r() * 0.12)) * 1000) / 1000
  const rend = (calc.volumeSerradoM3 / toras) * 100
  sql(
    `insert into public.producoes (id, data_producao, especie_id, toras_consumidas_m3, volume_serrado_m3, total_pecas, rendimento_percentual, created_at, updated_at, created_by) values (${q(pid)}, ${q(data)}, (select id from public.especies where nome = ${q(especie)}), ${q(paraNumeric(toras, 6))}, ${q(paraNumeric(calc.volumeSerradoM3, 6))}, ${calc.totalPecas}, ${q(paraNumeric(rend, 3))}, ${q(ts)}, ${q(ts)}, ${q(SECRETARIA)});`
  )
  linhasProd.forEach((l, k) => {
    const iid = itemEstoque(especie, l.ordem, l.b)
    sql(
      `insert into public.producoes_itens (producao_id, estoque_item_id, quantidade, volume_peca_m3, volume_total_m3, created_at, updated_at, created_by) values (${q(pid)}, ${q(iid)}, ${l.qtd}, ${q(paraNumeric(calc.linhas[k]!.volumePecaM3, 6))}, ${q(paraNumeric(calc.linhas[k]!.volumeTotalM3, 6))}, ${q(ts)}, ${q(ts)}, ${q(SECRETARIA)});`
    )
    sql(
      `insert into public.estoque_mov (estoque_item_id, tipo, quantidade, producao_id, observacao, created_at, updated_at, created_by) values (${q(iid)}, 'producao', ${l.qtd}, ${q(pid)}, ${q(`Produção nº ${i + 1}`)}, ${q(ts)}, ${q(ts)}, ${q(SECRETARIA)});`
    )
  })
  sql(
    `insert into public.estoque_toras_mov (especie_id, tipo, quantidade, unidade, producao_id, created_at, updated_at, created_by) values ((select id from public.especies where nome = ${q(especie)}), 'consumo', ${q(paraNumeric(-toras, 6))}, 'm3', ${q(pid)}, ${q(ts)}, ${q(ts)}, ${q(SECRETARIA)});`
  )
}

// ajustes de inventário (perdas e quebras)
let nAjuste = 0
for (const iid of [...itensEstoque.values()].filter((_, k) => k % 4 === 1)) {
  const ts = new Date(fim - (++nAjuste) * 5 * 86_400_000).toISOString()
  sql(
    `insert into public.estoque_mov (estoque_item_id, tipo, quantidade, motivo, observacao, created_at, updated_at, created_by) values (${q(iid)}, 'ajuste', ${-(5 + Math.floor(r() * 25))}, ${q(escolher(["quebra", "perda", "inventario"]))}, 'Contagem de pátio (exemplo)', ${q(ts)}, ${q(ts)}, ${q(SECRETARIA)});`
  )
}
for (const t of ["producoes", "producoes_itens", "estoque_mov", "estoque_itens"]) sql(`alter table public.${t} enable trigger carimbo;`)

writeFileSync(new URL("../supabase/seeds/dados_exemplo.sql", import.meta.url), linhas.join("\n") + "\n")
console.log(`dados_exemplo.sql gerado (${linhas.length} linhas)`)
