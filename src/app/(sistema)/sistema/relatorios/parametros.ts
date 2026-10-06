import { resolverPeriodo } from "@/lib/periodo"
import { TIPOS_RELATORIO, type FiltrosRelatorio, type TipoRelatorio } from "@/lib/relatorios"

export type ParamsRelatorio = Record<string, string | undefined>

export function lerParametros(p: ParamsRelatorio): {
  tipo: TipoRelatorio
  filtros: FiltrosRelatorio
} {
  const tipo = (
    TIPOS_RELATORIO.some((t) => t.valor === p.tipo) ? p.tipo : "vendas"
  ) as TipoRelatorio
  return {
    tipo,
    filtros: {
      periodo: resolverPeriodo({ periodo: p.periodo, de: p.de, ate: p.ate }),
      especieId: p.especie,
      fornecedorId: p.fornecedor,
      clienteId: p.cliente,
      motoristaId: p.motorista,
    },
  }
}
