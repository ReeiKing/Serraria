import { somar, totalVenda, valorTotal, volumePecasM3 } from "./calculos"
import { formatBitola, parseNumeroBR } from "./format"

export type ItemVendaCalculo = {
  /** "M3": madeira serrada vendida por m³ · "UN": produto vendido por unidade. Padrão: M3 */
  unidade?: "M3" | "UN"
  /** Medidas do item de estoque (só M3): número ou texto técnico do banco ("1.200" = 1,2). */
  espessuraCm?: string | number | null
  larguraCm?: string | number | null
  comprimentoM?: string | number | null
  /** Digitados pela pessoa (formato brasileiro, "1.200,50"). */
  quantidade: string | number
  /** R$ por m³ (M3) ou R$ por unidade (UN). */
  preco: string | number
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
    const qtd = Math.max(Math.trunc(n(i.quantidade)), 0)
    if (i.unidade === "UN") {
      return {
        unidade: "UN" as const,
        quantidade: qtd,
        volumeM3: 0,
        valor: valorTotal(qtd, n(i.preco)),
      }
    }
    const volumeM3 =
      qtd > 0 ? volumePecasM3(db(i.espessuraCm), db(i.larguraCm), db(i.comprimentoM), qtd) : 0
    return {
      unidade: "M3" as const,
      quantidade: qtd,
      volumeM3,
      valor: valorTotal(volumeM3, n(i.preco)),
    }
  })
  const valorProdutos = somar(
    linhas.map((l) => l.valor),
    2
  )
  return {
    linhas,
    /** peças de madeira serrada */
    totalPecas: linhas.filter((l) => l.unidade === "M3").reduce((a, l) => a + l.quantidade, 0),
    /** unidades de produtos (paletes, caixotes…) */
    totalUnidades: linhas.filter((l) => l.unidade === "UN").reduce((a, l) => a + l.quantidade, 0),
    totalM3: somar(linhas.map((l) => l.volumeM3)),
    valorProdutos,
    valorTotal: totalVenda(valorProdutos, n(frete), n(desconto)),
  }
}

/** Descrição do produto por unidade na venda, romaneio e NF-e. */
export function descricaoProduto(p: { nome: string; dimensoes?: string | null }) {
  return p.dimensoes ? `${p.nome} (${p.dimensoes})` : p.nome
}

export const CATEGORIAS_PRODUTO = [
  { valor: "palete", rotulo: "Palete" },
  { valor: "caixote", rotulo: "Caixote" },
  { valor: "outro", rotulo: "Outro" },
] as const

/** Descrição do item de madeira serrada na venda, romaneio e NF-e. */
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
  cancelada: { rotulo: "Cancelada", classe: "bg-destructive/15 text-red-700 dark:text-red-300" },
} as const

export const TIPOS_FRETE = [
  { valor: "cif", rotulo: "CIF — frete por conta da serraria" },
  { valor: "fob", rotulo: "FOB — frete por conta do cliente" },
  { valor: "sem_frete", rotulo: "Sem frete (cliente retira)" },
] as const
