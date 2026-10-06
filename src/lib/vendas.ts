import { somar, totalVenda, valorTotal, volumePecasM3 } from "./calculos"
import { formatBitola, parseNumeroBR } from "./format"

export type ItemVendaCalculo = {
  espessuraCm: string | number
  larguraCm: string | number
  comprimentoM: string | number
  quantidade: string | number
  precoM3: string | number
}

/** Valor digitado pela pessoa (padrão brasileiro). */
const n = (v: string | number | null | undefined) =>
  parseNumeroBR(v === null || v === undefined ? "" : v) ?? 0
/** Valor técnico vindo do banco (ponto decimal, "1.200" = 1,2). Nunca usar parseNumeroBR aqui. */
const db = (v: string | number | null | undefined) =>
  v === null || v === undefined || v === "" ? 0 : Number(v)

/** Volume e valor por item e totais da venda — mesma conta no navegador e no servidor. */
export function calcularVenda(
  itens: ItemVendaCalculo[],
  frete: string | number = 0,
  desconto: string | number = 0
) {
  const linhas = itens.map((i) => {
    const qtd = Math.trunc(n(i.quantidade))
    const volumeM3 =
      qtd > 0 ? volumePecasM3(db(i.espessuraCm), db(i.larguraCm), db(i.comprimentoM), qtd) : 0
    return { quantidade: Math.max(qtd, 0), volumeM3, valor: valorTotal(volumeM3, n(i.precoM3)) }
  })
  const valorProdutos = somar(
    linhas.map((l) => l.valor),
    2
  )
  return {
    linhas,
    totalPecas: linhas.reduce((a, l) => a + l.quantidade, 0),
    totalM3: somar(linhas.map((l) => l.volumeM3)),
    valorProdutos,
    valorTotal: totalVenda(valorProdutos, n(frete), n(desconto)),
  }
}

/** Descrição do item na venda, romaneio e NF-e. */
export function descricaoItem(i: {
  especie: string
  qualidade: string
  espessuraCm: string | number
  larguraCm: string | number
  comprimentoM: string | number
}) {
  return `Madeira serrada de ${i.especie} ${formatBitola(i.espessuraCm, i.larguraCm, i.comprimentoM)} m - ${i.qualidade}`
}

export const STATUS_VENDA = {
  rascunho: { rotulo: "Rascunho", classe: "bg-muted text-muted-foreground" },
  confirmada: { rotulo: "Confirmada", classe: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
  nfe_emitida: {
    rotulo: "NF-e emitida",
    classe: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  },
  entregue: { rotulo: "Entregue", classe: "bg-floresta/15 text-floresta" },
  cancelada: { rotulo: "Cancelada", classe: "bg-destructive/15 text-destructive" },
} as const

export const TIPOS_FRETE = [
  { valor: "cif", rotulo: "CIF — frete por conta da serraria" },
  { valor: "fob", rotulo: "FOB — frete por conta do cliente" },
  { valor: "sem_frete", rotulo: "Sem frete (cliente retira)" },
] as const
