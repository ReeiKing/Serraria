"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { BadgePagamento } from "@/components/sistema/badges"
import { TabelaDados, type Coluna } from "@/components/tabela/tabela-dados"
import { formatDataHora, formatMoeda, formatNumero, formatPlaca } from "@/lib/format"
import { SIGLA_UNIDADE } from "@/lib/schemas/entradas"
import { cn } from "@/lib/utils"

type Linha = {
  id: string
  numero: number
  createdAt: string
  especie: string
  fornecedor: string
  placa: string | null
  quantidade: string
  unidade: string
  valorTotal: string
  valorPago: string
  statusPagamento: string
}

const colunas: Coluna<Linha>[] = [
  {
    accessorKey: "numero",
    header: "Nº",
    cell: ({ row }) => (
      <span className="text-muted-foreground font-mono">{row.original.numero}</span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Data/hora",
    cell: ({ row }) => formatDataHora(row.original.createdAt),
  },
  {
    accessorKey: "fornecedor",
    header: "Fornecedor",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.fornecedor}</div>
        <div className="text-muted-foreground text-xs">
          {row.original.especie}
          {row.original.placa && ` · ${formatPlaca(row.original.placa)}`}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "quantidade",
    header: "Quantidade",
    sortFn: "basic",
    meta: { className: "text-right tabular-nums" },
    cell: ({ row }) =>
      `${formatNumero(row.original.quantidade, 3)} ${SIGLA_UNIDADE[row.original.unidade]}`,
  },
  {
    accessorKey: "valorTotal",
    header: "Total",
    meta: { className: "text-right tabular-nums hidden sm:table-cell" },
    cell: ({ row }) => formatMoeda(row.original.valorTotal),
  },
  {
    accessorKey: "statusPagamento",
    header: "Pagamento",
    cell: ({ row }) => <BadgePagamento status={row.original.statusPagamento} />,
  },
]

const FILTROS = [
  { valor: "", rotulo: "Todas" },
  { valor: "pendente", rotulo: "Pendentes" },
  { valor: "parcial", rotulo: "Parciais" },
  { valor: "pago", rotulo: "Pagas" },
]

export function ListaEntradas({ dados }: { dados: Linha[] }) {
  const router = useRouter()
  const [filtro, setFiltro] = useState("")
  const filtrados = filtro ? dados.filter((d) => d.statusPagamento === filtro) : dados

  return (
    <TabelaDados
      dados={filtrados}
      colunas={colunas}
      buscaPlaceholder="Buscar por fornecedor, espécie, placa ou nº"
      textoBusca={(d) =>
        `${d.numero} ${d.fornecedor} ${d.especie} ${d.placa ?? ""} ${formatPlaca(d.placa)}`
      }
      aoClicarLinha={(d) => router.push(`/sistema/entradas/${d.id}`)}
      vazio="Nenhuma entrada ainda. Clique em “Nova entrada” para registrar a primeira carga."
      acoes={
        <div className="bg-card flex gap-1 rounded-lg border p-1">
          {FILTROS.map((f) => (
            <button
              key={f.valor}
              type="button"
              onClick={() => setFiltro(f.valor)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors",
                filtro === f.valor
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {f.rotulo}
            </button>
          ))}
        </div>
      }
    />
  )
}
