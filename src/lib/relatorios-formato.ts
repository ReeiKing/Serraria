import { formatData, formatDataHora, formatMoeda, formatNumero, formatPercentual } from "./format"

type TipoColuna = "texto" | "moeda" | "m3" | "numero" | "inteiro" | "data" | "datahora" | "pct"

/** Texto exibido numa célula de relatório (tela e PDF). */
export function formatarCelula(
  valor: string | number | null | undefined,
  tipo: TipoColuna
): string {
  if (valor === null || valor === undefined || valor === "") return "—"
  switch (tipo) {
    case "moeda":
      return formatMoeda(valor)
    case "m3":
      return formatNumero(valor, 3, 3)
    case "numero":
      return formatNumero(valor, 2, 3)
    case "inteiro":
      return Number(valor).toLocaleString("pt-BR")
    case "pct":
      return formatPercentual(valor)
    case "data":
      return formatData(String(valor).length === 10 ? `${valor}T12:00:00` : valor)
    case "datahora":
      return formatDataHora(valor)
    default:
      return String(valor)
  }
}

export const ALINHA_DIREITA = new Set<TipoColuna>(["moeda", "m3", "numero", "inteiro", "pct"])
