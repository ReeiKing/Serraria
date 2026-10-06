"use client"

import { useRouter } from "next/navigation"

import { TabelaDados, type Coluna } from "@/components/tabela/tabela-dados"
import { Badge } from "@/components/ui/badge"
import { formatData } from "@/lib/format"

type Montagem = {
  id: string
  numero: number
  dataProducao: string
  totalUnidades: number
  resumo: string
  estornadaEm: string | null
}

const colunas: Coluna<Montagem>[] = [
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
    accessorKey: "resumo",
    header: "Produtos",
    cell: ({ row: { original: m } }) => (
      <span className="flex items-center gap-2">
        {m.resumo}
        {m.estornadaEm && (
          <Badge variant="outline" className="text-destructive">
            Estornada
          </Badge>
        )}
      </span>
    ),
  },
  {
    accessorKey: "totalUnidades",
    header: "Unidades",
    meta: { className: "text-right tabular-nums" },
    cell: ({ row }) => row.original.totalUnidades.toLocaleString("pt-BR"),
  },
]

export function ListaMontagens({ dados }: { dados: Montagem[] }) {
  const router = useRouter()
  return (
    <TabelaDados
      dados={dados}
      colunas={colunas}
      buscaPlaceholder="Buscar por produto ou nº"
      textoBusca={(m) => `${m.numero} ${m.resumo}`}
      aoClicarLinha={(m) => router.push(`/sistema/producao/produtos/${m.id}`)}
      vazio="Nenhuma montagem lançada."
    />
  )
}
