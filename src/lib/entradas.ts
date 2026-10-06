import {
  kgParaToneladas,
  pesoLiquido,
  somar,
  valorTotal,
  volumeEstereo,
  volumeToraM3,
} from "./calculos"
import { parseNumeroBR } from "./format"
import { UNIDADE_DO_MODO, type ModoMedicao } from "./schemas/entradas"

export type DadosMedicao = {
  modoMedicao: ModoMedicao
  cargaComprimentoM?: string | number | null
  cargaLarguraM?: string | number | null
  cargaAlturaM?: string | number | null
  pesoBrutoKg?: string | number | null
  taraKg?: string | number | null
  toras?: {
    diametroCm: string | number
    comprimentoM: string | number
    quantidade: string | number
  }[]
  valorUnitario?: string | number | null
}

const n = (v: string | number | null | undefined) =>
  parseNumeroBR(v === null || v === undefined ? "" : v) ?? 0

/**
 * Calcula a quantidade comprada (na unidade do modo) e o valor total.
 * Mesma função no navegador (tempo real) e no servidor (o que vale é o do servidor).
 */
export function calcularEntrada(d: DadosMedicao) {
  const unidade = UNIDADE_DO_MODO[d.modoMedicao]
  let quantidade = 0
  let pesoLiquidoKg: number | null = null
  const toras: {
    diametroCm: number
    comprimentoM: number
    quantidade: number
    volumeM3: number
  }[] = []

  if (d.modoMedicao === "estereo") {
    quantidade = volumeEstereo(n(d.cargaComprimentoM), n(d.cargaLarguraM), n(d.cargaAlturaM))
  } else if (d.modoMedicao === "tonelada") {
    pesoLiquidoKg = pesoLiquido(n(d.pesoBrutoKg), n(d.taraKg))
    quantidade = kgParaToneladas(pesoLiquidoKg)
  } else {
    for (const t of d.toras ?? []) {
      const diam = n(t.diametroCm)
      const comp = n(t.comprimentoM)
      const qtd = Math.trunc(n(t.quantidade))
      if (diam > 0 && comp > 0 && qtd > 0) {
        toras.push({
          diametroCm: diam,
          comprimentoM: comp,
          quantidade: qtd,
          volumeM3: volumeToraM3(diam, comp, qtd),
        })
      }
    }
    quantidade = somar(toras.map((t) => t.volumeM3))
  }

  return {
    unidade,
    quantidade,
    pesoLiquidoKg,
    toras,
    totalToras: toras.reduce((acc, t) => acc + t.quantidade, 0),
    valorTotal: valorTotal(quantidade, n(d.valorUnitario)),
  }
}
