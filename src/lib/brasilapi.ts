/** Consultas à BrasilAPI feitas pelo navegador (a API libera CORS). */
import { soDigitos } from "./validacao"

const BASE = "https://brasilapi.com.br/api"

export type Endereco = {
  cep: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  municipio: string
  uf: string
  codigoIbge: string
}

export type DadosCnpj = Endereco & {
  razaoSocial: string
  nomeFantasia: string
  telefone: string
  email: string
}

async function obter<T>(url: string): Promise<T> {
  const r = await fetch(url)
  if (r.status === 404) throw new Error("Não encontrado.")
  if (!r.ok) throw new Error("Serviço de consulta indisponível. Preencha manualmente.")
  return r.json() as Promise<T>
}

export async function buscarCnpj(cnpj: string): Promise<DadosCnpj> {
  const d = await obter<Record<string, string | number | null>>(
    `${BASE}/cnpj/v1/${soDigitos(cnpj)}`
  )
  const s = (k: string) => (d[k] === null || d[k] === undefined ? "" : String(d[k]))
  const tipo = s("descricao_tipo_de_logradouro")
  const logradouro = s("logradouro")
  return {
    razaoSocial: s("razao_social"),
    nomeFantasia: s("nome_fantasia"),
    cep: soDigitos(s("cep")),
    logradouro:
      tipo && !logradouro.toUpperCase().startsWith(tipo.toUpperCase())
        ? `${tipo} ${logradouro}`
        : logradouro,
    numero: s("numero"),
    complemento: s("complemento"),
    bairro: s("bairro"),
    municipio: s("municipio"),
    uf: s("uf"),
    codigoIbge: s("codigo_municipio_ibge"),
    telefone: soDigitos(s("ddd_telefone_1")),
    email: s("email").toLowerCase(),
  }
}

const normalizar = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().trim()

/** Código IBGE do município (necessário na NF-e). */
export async function buscarCodigoIbge(municipio: string, uf: string): Promise<string> {
  if (!municipio || !uf) return ""
  try {
    const lista = await obter<{ nome: string; codigo_ibge: string }[]>(
      `${BASE}/ibge/municipios/v1/${uf}?providers=dados-abertos-br,gov,wikipedia`
    )
    const alvo = normalizar(municipio)
    return lista.find((m) => normalizar(m.nome) === alvo)?.codigo_ibge ?? ""
  } catch {
    return ""
  }
}

export async function buscarCep(cep: string): Promise<Endereco> {
  const d = await obter<{
    cep: string
    state: string
    city: string
    neighborhood: string
    street: string
  }>(`${BASE}/cep/v2/${soDigitos(cep)}`)
  return {
    cep: soDigitos(d.cep),
    logradouro: d.street ?? "",
    numero: "",
    complemento: "",
    bairro: d.neighborhood ?? "",
    municipio: d.city ?? "",
    uf: d.state ?? "",
    codigoIbge: await buscarCodigoIbge(d.city, d.state),
  }
}
