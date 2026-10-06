"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { BadgeVenda } from "@/components/sistema/badge-venda"
import { TabelaDados, type Coluna } from "@/components/tabela/tabela-dados"
import { formatDataHora, formatMoeda, formatNumero, formatPlaca } from "@/lib/format"
import { cn } from "@/lib/utils"
import { STATUS_VENDA } from "@/lib/vendas"

type Status = keyof typeof STATUS_VENDA
type Linha = {
  id: string
  numero: number
  createdAt: string
  cliente: string
  destino: string
  placa: string | null
  totalM3: string
  totalPecas: number
  valorTotal: string
  status: Status
  romaneio: number | null
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
    meta: { className: "hidden sm:table-cell" },
  },
  {
    accessorKey: "cliente",
    header: "Cliente",
    cell: ({ row: { original: v } }) => (
      <div>
        <div className="font-medium">{v.cliente}</div>
        <div className="text-muted-foreground text-xs">
          {v.destino}
          {v.placa && ` · ${formatPlaca(v.placa)}`}
          {v.romaneio && ` · Romaneio ${v.romaneio}`}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "totalM3",
    header: "m³",
    sortFn: "basic",
    meta: { className: "text-right tabular-nums" },
    cell: ({ row }) => formatNumero(row.original.totalM3, 3),
  },
  {
    accessorKey: "valorTotal",
    header: "Total",
    sortFn: "basic",
    meta: { className: "text-right tabular-nums" },
    cell: ({ row }) => formatMoeda(row.original.valorTotal),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <BadgeVenda status={row.original.status} />,
  },
]

const FILTROS: { valor: string; rotulo: string }[] = [
  { valor: "", rotulo: "Todas" },
  ...Object.entries(STATUS_VENDA).map(([valor, s]) => ({ valor, rotulo: s.rotulo })),
]

export function ListaVendas({ dados }: { dados: Linha[] }) {
  const router = useRouter()
  const [filtro, setFiltro] = useState("")
  return (
    <div className="flex flex-col gap-3">
      <div className="bg-card flex flex-wrap gap-1 self-start rounded-lg border p-1">
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
            <span className="ml-1.5 text-xs opacity-70">
              {f.valor ? dados.filter((d) => d.status === f.valor).length : dados.length}
            </span>
          </button>
        ))}
      </div>
      <TabelaDados
        dados={filtro ? dados.filter((d) => d.status === filtro) : dados}
        colunas={colunas}
        buscaPlaceholder="Buscar por cliente, destino, placa, nº da venda ou romaneio"
        textoBusca={(d) =>
          `${d.numero} ${d.cliente} ${d.destino} ${d.placa ?? ""} ${formatPlaca(d.placa)} romaneio ${d.romaneio ?? ""}`
        }
        aoClicarLinha={(d) => router.push(`/sistema/vendas/${d.id}`)}
        vazio="Nenhuma venda ainda."
      />
    </div>
  )
}
