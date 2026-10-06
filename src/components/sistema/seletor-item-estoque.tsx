"use client"

import { Check, ChevronsUpDown } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { formatBitola } from "@/lib/format"
import { normalizarBitola } from "@/lib/producao"
import { cn } from "@/lib/utils"

export type OpcaoItemEstoque = {
  id: string
  especie: string
  qualidade: string
  espessuraCm: string
  larguraCm: string
  comprimentoM: string
  saldoPecas: number
  precoM3: string | null
}

const semAcento = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

export function rotuloItem(i: OpcaoItemEstoque) {
  return `${i.especie} ${formatBitola(i.espessuraCm, i.larguraCm, i.comprimentoM)} · ${i.qualidade}`
}

/** Escolha de bitola do estoque com busca por medida ("1,8 x 9") e saldo disponível. */
export function SeletorItemEstoque({
  itens,
  valor,
  aoMudar,
  invalido,
  rotuloAcessivel,
}: {
  itens: OpcaoItemEstoque[]
  valor: string
  aoMudar: (id: string) => void
  invalido?: boolean
  rotuloAcessivel: string
}) {
  const [aberto, setAberto] = useState(false)
  const atual = itens.find((i) => i.id === valor)
  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-label={rotuloAcessivel}
          aria-invalid={invalido}
          className="h-11 w-full justify-between font-normal"
        >
          <span className={cn("truncate", !atual && "text-muted-foreground")}>
            {atual ? rotuloItem(atual) : "Escolha a bitola"}
          </span>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(32rem,92vw)] p-0" align="start">
        <Command
          filter={(texto, busca) => {
            const t = semAcento(texto)
            return t.includes(semAcento(busca)) || t.includes(normalizarBitola(busca)) ? 1 : 0
          }}
        >
          <CommandInput placeholder="Buscar: pinus, 1,8 x 9, 1ª…" />
          <CommandList>
            <CommandEmpty>Nenhuma bitola encontrada.</CommandEmpty>
            <CommandGroup>
              {itens.map((i) => {
                const b = formatBitola(i.espessuraCm, i.larguraCm, i.comprimentoM)
                return (
                  <CommandItem
                    key={i.id}
                    value={`${i.especie} ${b} ${normalizarBitola(b)} ${i.qualidade} ${i.id}`}
                    onSelect={() => {
                      aoMudar(i.id)
                      setAberto(false)
                    }}
                  >
                    <Check className={cn("size-4", i.id === valor ? "opacity-100" : "opacity-0")} />
                    <span className="flex-1">{rotuloItem(i)}</span>
                    <span
                      className={cn(
                        "text-xs tabular-nums",
                        i.saldoPecas > 0 ? "text-muted-foreground" : "text-destructive"
                      )}
                    >
                      {i.saldoPecas.toLocaleString("pt-BR")} pç
                    </span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
