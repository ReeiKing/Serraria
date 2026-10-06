import { TZDate } from "@date-fns/tz"
import { format } from "date-fns"

export const FUSO_HORARIO = "America/Sao_Paulo"

const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })

type Numerico = number | string | null | undefined

function paraNumero(valor: Numerico): number {
  if (valor === null || valor === undefined || valor === "") return 0
  return typeof valor === "number" ? valor : Number(valor)
}

/** R$ 1.234,56 */
export function formatMoeda(valor: Numerico): string {
  return moeda.format(paraNumero(valor))
}

/** 1.234,56 — `casas` fixas por padrão; passe `max` para permitir casas variáveis. */
export function formatNumero(valor: Numerico, casas = 2, max = casas): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: max,
  }).format(paraNumero(valor))
}

/** Volume em m³ com até 6 casas (precisão de uma peça): 0,001944 */
export function formatM3(valor: Numerico): string {
  return formatNumero(valor, 3, 6)
}

/** Percentual com 1 casa: 45,3% */
export function formatPercentual(valor: Numerico): string {
  return `${formatNumero(valor, 1)}%`
}

/**
 * Converte texto digitado no padrão brasileiro em número.
 * - Com vírgula: "1,8" → 1.8 · "1.234,56" → 1234.56
 * - Sem vírgula, ponto seguido de grupos de 3 dígitos: milhar ("45.300" → 45300, "1.234.567" → 1234567)
 * - Sem vírgula e outro uso do ponto: decimal ("1.8" → 1.8, "0.125" → 0.125)
 * Retorna `null` quando o texto não é um número válido.
 */
export function parseNumeroBR(texto: string | number | null | undefined): number | null {
  if (texto === null || texto === undefined) return null
  if (typeof texto === "number") return Number.isFinite(texto) ? texto : null

  let s = texto.replace(/R\$|\s| /g, "")
  if (s === "") return null

  // Parte inteira: dígitos simples ou agrupados de 3 em 3 com ponto ("1.234.567").
  const inteiro = String.raw`(\d+|\d{1,3}(\.\d{3})+)`
  if (new RegExp(String.raw`^-?(${inteiro})?,\d*$`).test(s) && /\d/.test(s)) {
    s = s.replace(/\./g, "").replace(",", ".")
  } else if (new RegExp(String.raw`^-?[1-9]\d{0,2}(\.\d{3})+$`).test(s)) {
    s = s.replace(/\./g, "")
  } else if (!/^-?(\d+\.?\d*|\.\d+)$/.test(s)) {
    return null
  }

  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

function noFuso(data: Date | string | number): TZDate {
  return new TZDate(new Date(data), FUSO_HORARIO)
}

/** dd/MM/yyyy HH:mm no fuso de São Paulo */
export function formatDataHora(data: Date | string | number): string {
  return format(noFuso(data), "dd/MM/yyyy HH:mm")
}

/** dd/MM/yyyy no fuso de São Paulo */
export function formatData(data: Date | string | number): string {
  return format(noFuso(data), "dd/MM/yyyy")
}

/** Data/hora atual no fuso de São Paulo */
export function agoraSP(): TZDate {
  return TZDate.tz(FUSO_HORARIO)
}

/** 11222333000181 → 11.222.333/0001-81 · 52998224725 → 529.982.247-25 */
export function formatDocumento(doc: string | null | undefined): string {
  const d = (doc ?? "").replace(/\D/g, "")
  if (d.length === 14) return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")
  if (d.length === 11) return d.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4")
  return doc ?? ""
}

/** 84000000 → 84000-000 */
export function formatCep(cep: string | null | undefined): string {
  const d = (cep ?? "").replace(/\D/g, "")
  return d.length === 8 ? `${d.slice(0, 5)}-${d.slice(5)}` : (cep ?? "")
}

/** 42999990000 → (42) 99999-0000 */
export function formatTelefone(tel: string | null | undefined): string {
  const d = (tel ?? "").replace(/\D/g, "")
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return tel ?? ""
}

/** ABC1D23 → ABC-1D23 */
export function formatPlaca(placa: string | null | undefined): string {
  const p = placa ?? ""
  return p.length === 7 ? `${p.slice(0, 3)}-${p.slice(3)}` : p
}

/** Número para exibir num campo de formulário (vírgula decimal, sem milhar). */
export function numeroParaCampo(v: number | string | null | undefined): string {
  if (v === null || v === undefined || v === "") return ""
  return String(Number(v)).replace(".", ",")
}

/** Medida da peça: 1,8 × 9 × 1,20 */
export function formatBitola(
  espCm: number | string,
  largCm: number | string,
  compM: number | string
): string {
  return `${formatNumero(espCm, 0, 2)} × ${formatNumero(largCm, 0, 2)} × ${formatNumero(compM, 2, 3)}`
}
