import { formatBitola } from "./format"
import { normalizarBitola } from "./producao"

/** Item que pode entrar numa venda: madeira serrada (M3) ou produto por unidade (UN). */
export type OpcaoItemVenda = {
  tipo: "M3" | "UN"
  id: string
  rotulo: string
  /** texto extra para a busca (medidas normalizadas, categoria…) */
  busca: string
  saldo: number
  /** R$/m³ (M3) ou R$/unidade (UN), texto técnico do banco */
  preco: string | null
  espessuraCm?: string
  larguraCm?: string
  comprimentoM?: string
}

export const chaveItem = (tipo: string, id: string) => `${tipo}:${id}`

export function opcaoMadeira(i: {
  id: string
  especie: string
  qualidade: string
  espessuraCm: string
  larguraCm: string
  comprimentoM: string
  saldoPecas: number
  precoM3: string | null
}): OpcaoItemVenda {
  const b = formatBitola(i.espessuraCm, i.larguraCm, i.comprimentoM)
  return {
    tipo: "M3",
    id: i.id,
    rotulo: `${i.especie} ${b} · ${i.qualidade}`,
    busca: `${i.especie} ${b} ${normalizarBitola(b)} ${i.qualidade}`,
    saldo: i.saldoPecas,
    preco: i.precoM3,
    espessuraCm: i.espessuraCm,
    larguraCm: i.larguraCm,
    comprimentoM: i.comprimentoM,
  }
}
