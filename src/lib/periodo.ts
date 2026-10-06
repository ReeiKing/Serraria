import { TZDate } from "@date-fns/tz"
import {
  endOfMonth,
  endOfYear,
  format,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
} from "date-fns"

import { FUSO_HORARIO } from "./format"

export const PERIODOS = [
  { valor: "mes", rotulo: "Este mês" },
  { valor: "mes-anterior", rotulo: "Mês anterior" },
  { valor: "30d", rotulo: "Últimos 30 dias" },
  { valor: "90d", rotulo: "Últimos 90 dias" },
  { valor: "ano", rotulo: "Este ano" },
  { valor: "custom", rotulo: "Personalizado" },
] as const

export type ChavePeriodo = (typeof PERIODOS)[number]["valor"]

/** Intervalo de datas (yyyy-MM-dd, inclusivo) no fuso de São Paulo. */
export type Periodo = { chave: ChavePeriodo; de: string; ate: string; rotulo: string }

const ISO = /^\d{4}-\d{2}-\d{2}$/
const dia = (d: Date) => format(d, "yyyy-MM-dd")

export function resolverPeriodo(
  params: { periodo?: string; de?: string; ate?: string },
  agora: Date = new Date()
): Periodo {
  const hoje = new TZDate(agora, FUSO_HORARIO)
  const chave = (
    PERIODOS.some((p) => p.valor === params.periodo) ? params.periodo : "mes"
  ) as ChavePeriodo
  const rotulo = PERIODOS.find((p) => p.valor === chave)!.rotulo

  switch (chave) {
    case "mes-anterior": {
      const m = subMonths(hoje, 1)
      return { chave, rotulo, de: dia(startOfMonth(m)), ate: dia(endOfMonth(m)) }
    }
    case "30d":
      return { chave, rotulo, de: dia(subDays(hoje, 29)), ate: dia(hoje) }
    case "90d":
      return { chave, rotulo, de: dia(subDays(hoje, 89)), ate: dia(hoje) }
    case "ano":
      return { chave, rotulo, de: dia(startOfYear(hoje)), ate: dia(endOfYear(hoje)) }
    case "custom": {
      const de = params.de && ISO.test(params.de) ? params.de : dia(startOfMonth(hoje))
      const ate = params.ate && ISO.test(params.ate) ? params.ate : dia(hoje)
      return de <= ate ? { chave, rotulo, de, ate } : { chave, rotulo, de: ate, ate: de }
    }
    default:
      return { chave: "mes", rotulo, de: dia(startOfMonth(hoje)), ate: dia(endOfMonth(hoje)) }
  }
}
