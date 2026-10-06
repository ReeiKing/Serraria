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
 * - Sem vírgula e um único ponto: tratado como decimal ("1.8" → 1.8)
 * - Sem vírgula e vários pontos: separadores de milhar ("1.234.567" → 1234567)
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
  } else if (new RegExp(String.raw`^-?\d{1,3}(\.\d{3}){2,}$`).test(s)) {
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
