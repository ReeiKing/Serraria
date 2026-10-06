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
import { normalizarBitola } from "@/lib/producao"
import { chaveItem, type OpcaoItemVenda } from "@/lib/itens-venda"
import { cn } from "@/lib/utils"

export { chaveItem, opcaoMadeira, type OpcaoItemVenda } from "@/lib/itens-venda"

const semAcento = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

const GRUPOS = [
  { tipo: "M3" as const, titulo: "Madeira serrada (m³)", sufixo: "pç" },
  { tipo: "UN" as const, titulo: "Paletes, caixotes e outros (unidade)", sufixo: "un." },
]

/** Escolha do item da venda com busca por medida ("1,8 x 9") ou nome, mostrando o saldo. */
export function SeletorItemEstoque({
  itens,
  valor,
  aoMudar,
  invalido,
  rotuloAcessivel,
}: {
  itens: OpcaoItemVenda[]
  /** chave "M3:id" ou "UN:id" */
  valor: string
  aoMudar: (item: OpcaoItemVenda) => void
  invalido?: boolean
  rotuloAcessivel: string
}) {
  const [aberto, setAberto] = useState(false)
  const atual = itens.find((i) => chaveItem(i.tipo, i.id) === valor)
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
            {atual ? atual.rotulo : "Escolha o item"}
          </span>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(34rem,92vw)] p-0" align="start">
        <Command
          filter={(texto, busca) => {
            const t = semAcento(texto)
            return t.includes(semAcento(busca)) || t.includes(normalizarBitola(busca)) ? 1 : 0
          }}
        >
          <CommandInput placeholder="Buscar: pinus, 1,8 x 9, palete…" />
          <CommandList>
            <CommandEmpty>Nada encontrado.</CommandEmpty>
            {GRUPOS.map((g) => {
              const lista = itens.filter((i) => i.tipo === g.tipo)
              if (!lista.length) return null
              return (
                <CommandGroup key={g.tipo} heading={g.titulo}>
                  {lista.map((i) => {
                    const chave = chaveItem(i.tipo, i.id)
                    return (
                      <CommandItem
                        key={chave}
                        value={`${i.rotulo} ${i.busca} ${chave}`}
                        onSelect={() => {
                          aoMudar(i)
                          setAberto(false)
                        }}
                      >
                        <Check
                          className={cn("size-4", chave === valor ? "opacity-100" : "opacity-0")}
                        />
                        <span className="flex-1">{i.rotulo}</span>
                        <span
                          className={cn(
                            "text-xs tabular-nums",
                            i.saldo > 0 ? "text-muted-foreground" : "text-destructive"
                          )}
                        >
                          {i.saldo.toLocaleString("pt-BR")} {g.sufixo}
                        </span>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              )
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
