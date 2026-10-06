"use client"

import { FileSpreadsheet, FileText } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Opcao = { valor: string; rotulo: string }
const TODOS = "__todos__"

export function FiltrosRelatorio({
  campos,
}: {
  campos: { nome: string; rotulo: string; opcoes: Opcao[] }[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  function mudar(nome: string, valor: string) {
    const q = new URLSearchParams(params)
    if (valor === TODOS) q.delete(nome)
    else q.set(nome, valor)
    router.push(`${pathname}?${q.toString()}`, { scroll: false })
  }

  return (
    <div className="flex flex-wrap gap-2">
      {campos.map((c) => (
        <Select
          key={c.nome}
          value={params.get(c.nome) ?? TODOS}
          onValueChange={(v) => mudar(c.nome, v)}
        >
          <SelectTrigger className="h-10 w-auto min-w-44" aria-label={c.rotulo}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>{c.rotulo}: todos</SelectItem>
            {c.opcoes.map((o) => (
              <SelectItem key={o.valor} value={o.valor}>
                {o.rotulo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
    </div>
  )
}

export function BotoesExportar() {
  const params = useSearchParams()
  const link = (formato: string) => {
    const q = new URLSearchParams(params)
    q.set("formato", formato)
    return `/sistema/relatorios/exportar?${q.toString()}`
  }
  return (
    <div className="flex gap-2">
      <Button asChild variant="outline" size="lg">
        <a href={link("xlsx")}>
          <FileSpreadsheet className="text-floresta" /> Excel
        </a>
      </Button>
      <Button asChild variant="outline" size="lg">
        <a href={link("pdf")} target="_blank" rel="noreferrer">
          <FileText className="text-destructive" /> PDF
        </a>
      </Button>
    </div>
  )
}
