"use client"

import {
  createPaginatedRowModel,
  createSortedRowModel,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  useTable,
  type ColumnDef,
  type RowData,
} from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { useState, type ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export const recursosTabela = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    text: sortFn_text,
    basic: sortFn_basic,
    datetime: sortFn_datetime,
  },
})

export type Coluna<T extends RowData> = ColumnDef<typeof recursosTabela, T>

/** Remove acentos para a busca achar "eucalipto" ao digitar "eucalípto" e vice-versa. */
const semAcento = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

export function TabelaDados<T extends RowData>({
  dados,
  colunas,
  buscaPlaceholder = "Buscar…",
  vazio = "Nenhum registro encontrado.",
  acoes,
  aoClicarLinha,
  tamanhoPagina = 20,
  textoBusca,
}: {
  dados: T[]
  colunas: Coluna<T>[]
  buscaPlaceholder?: string
  vazio?: ReactNode
  /** Botões à direita da busca (ex.: "Novo"). */
  acoes?: ReactNode
  aoClicarLinha?: (linha: T) => void
  tamanhoPagina?: number
  /** Texto pesquisável de cada linha (padrão: todos os valores de texto/número). */
  textoBusca?: (linha: T) => string
}) {
  const [busca, setBusca] = useState("")

  const filtrados = busca
    ? dados.filter((d) => {
        const alvo = textoBusca
          ? textoBusca(d)
          : Object.values(d as Record<string, unknown>).join(" ")
        return semAcento(alvo).includes(semAcento(busca))
      })
    : dados

  const table = useTable({
    features: recursosTabela,
    columns: colunas,
    data: filtrados,
    initialState: { pagination: { pageIndex: 0, pageSize: tamanhoPagina } },
  })

  const { pageIndex } = table.state.pagination
  const totalPaginas = table.getPageCount()

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value)
              table.setPageIndex(0)
            }}
            placeholder={buscaPlaceholder}
            aria-label="Buscar"
            className="h-10 pl-9"
          />
        </div>
        {acoes && <div className="flex gap-2 sm:ml-auto">{acoes}</div>}
      </div>

      <div className="bg-card overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((grupo) => (
              <TableRow key={grupo.id} className="hover:bg-transparent">
                {grupo.headers.map((header) => {
                  const ordenavel = header.column.getCanSort()
                  const ordem = header.column.getIsSorted()
                  const meta = header.column.columnDef.meta as { className?: string } | undefined
                  return (
                    <TableHead key={header.id} className={cn("bg-muted/50", meta?.className)}>
                      {header.isPlaceholder ? null : ordenavel ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="hover:text-foreground -ml-1 inline-flex items-center gap-1 rounded px-1 py-0.5"
                        >
                          <table.FlexRender header={header} />
                          {ordem === "asc" ? (
                            <ArrowUp className="size-3.5" />
                          ) : ordem === "desc" ? (
                            <ArrowDown className="size-3.5" />
                          ) : (
                            <ArrowUpDown className="size-3.5 opacity-40" />
                          )}
                        </button>
                      ) : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={colunas.length}
                  className="text-muted-foreground h-28 text-center"
                >
                  {vazio}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={aoClicarLinha ? () => aoClicarLinha(row.original) : undefined}
                  className={cn(aoClicarLinha && "cursor-pointer")}
                >
                  {row.getAllCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as { className?: string } | undefined
                    return (
                      <TableCell key={cell.id} className={meta?.className}>
                        <table.FlexRender cell={cell} />
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPaginas > 1 && (
        <div className="text-muted-foreground flex items-center justify-end gap-2 text-sm">
          <span>
            Página {pageIndex + 1} de {totalPaginas} · {filtrados.length} registros
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Página anterior"
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Próxima página"
          >
            <ChevronRight />
          </Button>
        </div>
      )}
    </div>
  )
}
