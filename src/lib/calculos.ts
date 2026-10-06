import Decimal from "decimal.js"

/**
 * Regras de cálculo da serraria. Tudo em decimal.js para evitar erro de ponto
 * flutuante (0,1 + 0,2). Volumes saem com 6 casas e dinheiro com 2 (arredondamento
 * comercial, meia para cima).
 */

const D = Decimal.clone({ precision: 40, rounding: Decimal.ROUND_HALF_UP })

export type Valor = number | string | Decimal

export const CASAS_VOLUME = 6
export const CASAS_MOEDA = 2

function dec(v: Valor | null | undefined): Decimal {
  if (v === null || v === undefined || v === "") return new D(0)
  return new D(v)
}

function arred(v: Decimal, casas: number): number {
  return v.toDecimalPlaces(casas, Decimal.ROUND_HALF_UP).toNumber()
}

/** Volume de uma peça serrada (m³) = (esp/100) × (larg/100) × comp. Ex.: 1,8 × 9 × 1,20 = 0,001944 */
export function volumePecaM3(espessuraCm: Valor, larguraCm: Valor, comprimentoM: Valor): number {
  return arred(
    dec(espessuraCm).div(100).mul(dec(larguraCm).div(100)).mul(dec(comprimentoM)),
    CASAS_VOLUME
  )
}

/** Volume de N peças iguais (m³), calculado a partir da peça sem arredondamento intermediário. */
export function volumePecasM3(
  espessuraCm: Valor,
  larguraCm: Valor,
  comprimentoM: Valor,
  quantidade: Valor
): number {
  return arred(
    dec(espessuraCm)
      .div(100)
      .mul(dec(larguraCm).div(100))
      .mul(dec(comprimentoM))
      .mul(dec(quantidade)),
    CASAS_VOLUME
  )
}

/** Volume de uma tora (m³) = π × (D/200)² × L, com D em cm e L em m. */
export function volumeToraM3(
  diametroCm: Valor,
  comprimentoM: Valor,
  quantidade: Valor = 1
): number {
  const raio = dec(diametroCm).div(200)
  return arred(
    D.acos(-1).mul(raio.pow(2)).mul(dec(comprimentoM)).mul(dec(quantidade)),
    CASAS_VOLUME
  )
}

/** Metro estéreo da carga = comprimento × largura × altura (m). */
export function volumeEstereo(comprimentoM: Valor, larguraM: Valor, alturaM: Valor): number {
  return arred(dec(comprimentoM).mul(dec(larguraM)).mul(dec(alturaM)), CASAS_VOLUME)
}

/** Peso líquido (kg) = bruto − tara; nunca negativo. */
export function pesoLiquido(brutoKg: Valor, taraKg: Valor): number {
  return arred(D.max(dec(brutoKg).minus(dec(taraKg)), 0), 2)
}

/** kg → toneladas (6 casas). */
export function kgParaToneladas(kg: Valor): number {
  return arred(dec(kg).div(1000), CASAS_VOLUME)
}

/** Valor total = quantidade × unitário, arredondado para centavos. */
export function valorTotal(quantidade: Valor, unitario: Valor): number {
  return arred(dec(quantidade).mul(dec(unitario)), CASAS_MOEDA)
}

/** Rendimento da serraria (%) = m³ serrado ÷ m³ de tora × 100. Null se não houver tora. */
export function rendimento(m3Serrado: Valor, m3Tora: Valor): number | null {
  const tora = dec(m3Tora)
  if (tora.lte(0)) return null
  return arred(dec(m3Serrado).div(tora).mul(100), 2)
}

/** Soma precisa de uma lista de valores. */
export function somar(valores: Valor[], casas = CASAS_VOLUME): number {
  return arred(
    valores.reduce<Decimal>((acc, v) => acc.plus(dec(v)), new D(0)),
    casas
  )
}

/** Total de uma venda: produtos + frete − desconto (nunca negativo). */
export function totalVenda(valorProdutos: Valor, frete: Valor = 0, desconto: Valor = 0): number {
  return arred(D.max(dec(valorProdutos).plus(dec(frete)).minus(dec(desconto)), 0), CASAS_MOEDA)
}

/** Converte para string decimal com N casas (para gravar em colunas numeric). */
export function paraNumeric(v: Valor, casas: number): string {
  return dec(v).toDecimalPlaces(casas, Decimal.ROUND_HALF_UP).toFixed(casas)
}
