import { rendimento, somar, volumePecaM3, volumePecasM3 } from "./calculos"
import { parseNumeroBR } from "./format"

export type LinhaPeca = {
  espessuraCm: string | number
  larguraCm: string | number
  comprimentoM: string | number
  quantidade: string | number
}

const n = (v: string | number | null | undefined) =>
  parseNumeroBR(v === null || v === undefined ? "" : v) ?? 0

/** Volume por linha, totais e rendimento — mesma conta no navegador e no servidor. */
export function calcularProducao(itens: LinhaPeca[], torasConsumidasM3?: string | number | null) {
  const linhas = itens.map((i) => {
    const esp = n(i.espessuraCm)
    const larg = n(i.larguraCm)
    const comp = n(i.comprimentoM)
    const qtd = Math.trunc(n(i.quantidade))
    const valida = esp > 0 && larg > 0 && comp > 0 && qtd > 0
    return {
      volumePecaM3: valida ? volumePecaM3(esp, larg, comp) : 0,
      volumeTotalM3: valida ? volumePecasM3(esp, larg, comp, qtd) : 0,
      quantidade: valida ? qtd : 0,
    }
  })
  const volumeSerradoM3 = somar(linhas.map((l) => l.volumeTotalM3))
  const tora = n(torasConsumidasM3)
  return {
    linhas,
    volumeSerradoM3,
    totalPecas: linhas.reduce((a, l) => a + l.quantidade, 0),
    rendimento: tora > 0 ? rendimento(volumeSerradoM3, tora) : null,
  }
}

/** Normaliza texto de bitola para busca: "1,8 × 9" → "1.8x9". */
export function normalizarBitola(texto: string) {
  return texto
    .toLowerCase()
    .replace(/×|\*/g, "x")
    .replace(/,/g, ".")
    .replace(/\s+/g, "")
    .replace(/(\.\d*?)0+(?=x|$)/g, "$1")
    .replace(/\.(?=x|$)/g, "")
}

/** Cor do rendimento: < 35% ruim, < 50% médio, ≥ 50% bom. */
export function corRendimento(r: number | null) {
  if (r === null) return "text-muted-foreground"
  if (r < 35) return "text-destructive"
  if (r < 50) return "text-amber-600 dark:text-amber-400"
  return "text-floresta"
}
