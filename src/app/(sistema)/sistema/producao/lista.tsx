"use client"

import { useRouter } from "next/navigation"

import { TabelaDados, type Coluna } from "@/components/tabela/tabela-dados"
import { Badge } from "@/components/ui/badge"
import { formatData, formatNumero, formatPercentual } from "@/lib/format"
import { corRendimento } from "@/lib/producao"
import { cn } from "@/lib/utils"

type Linha = {
  id: string
  numero: number
  dataProducao: string
  especie: string
  torasConsumidasM3: string | null
  volumeSerradoM3: string
  totalPecas: number
  rendimento: string | null
  estornadaEm: string | null
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
    accessorKey: "dataProducao",
    header: "Data",
    cell: ({ row }) => formatData(`${row.original.dataProducao}T12:00:00`),
  },
  {
    accessorKey: "especie",
    header: "Espécie",
    cell: ({ row }) => (
      <span className="flex items-center gap-2">
        {row.original.especie}
        {row.original.estornadaEm && (
          <Badge variant="outline" className="text-destructive">
            Estornada
          </Badge>
        )}
      </span>
    ),
  },
  {
    accessorKey: "torasConsumidasM3",
    header: "Tora",
    meta: { className: "text-right tabular-nums hidden sm:table-cell" },
    cell: ({ row }) =>
      row.original.torasConsumidasM3
        ? `${formatNumero(row.original.torasConsumidasM3, 3)} m³`
        : "—",
  },
  {
    accessorKey: "volumeSerradoM3",
    header: "Serrado",
    meta: { className: "text-right tabular-nums" },
    cell: ({ row }) => `${formatNumero(row.original.volumeSerradoM3, 3)} m³`,
  },
  {
    accessorKey: "totalPecas",
    header: "Peças",
    meta: { className: "text-right tabular-nums hidden md:table-cell" },
    cell: ({ row }) => row.original.totalPecas.toLocaleString("pt-BR"),
  },
  {
    accessorKey: "rendimento",
    header: "Rendimento",
    meta: { className: "text-right tabular-nums" },
    cell: ({ row }) => {
      const r = row.original.rendimento === null ? null : Number(row.original.rendimento)
      return (
        <span className={cn("font-semibold", corRendimento(r))}>
          {r === null ? "—" : formatPercentual(r)}
        </span>
      )
    },
  },
]

export function ListaProducoes({ dados }: { dados: Linha[] }) {
  const router = useRouter()
  return (
    <TabelaDados
      dados={dados}
      colunas={colunas}
      buscaPlaceholder="Buscar por espécie ou nº"
      textoBusca={(d) => `${d.numero} ${d.especie}`}
      aoClicarLinha={(d) => router.push(`/sistema/producao/${d.id}`)}
      vazio="Nenhuma produção lançada ainda."
    />
  )
}
