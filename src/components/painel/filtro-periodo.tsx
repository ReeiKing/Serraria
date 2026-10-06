"use client"

import { CalendarRange } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatData } from "@/lib/format"
import { PERIODOS, type Periodo } from "@/lib/periodo"
import { cn } from "@/lib/utils"

/** Presets de período + intervalo personalizado, sincronizados com a URL. */
export function FiltroPeriodo({ periodo }: { periodo: Periodo }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [de, setDe] = useState(periodo.de)
  const [ate, setAte] = useState(periodo.ate)

  function ir(valores: Record<string, string>) {
    const q = new URLSearchParams(params)
    for (const [k, v] of Object.entries(valores)) q.set(k, v)
    if (valores.periodo !== "custom") {
      q.delete("de")
      q.delete("ate")
    }
    router.push(`${pathname}?${q.toString()}`, { scroll: false })
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="bg-card flex flex-wrap items-center gap-1 rounded-lg border p-1">
        {PERIODOS.map((p) => (
          <button
            key={p.valor}
            type="button"
            onClick={() =>
              p.valor === "custom" ? ir({ periodo: "custom", de, ate }) : ir({ periodo: p.valor })
            }
            className={cn(
              "rounded-md px-3 py-1.5 text-sm transition-colors",
              periodo.chave === p.valor
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            {p.rotulo}
          </button>
        ))}
      </div>
      <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
        <CalendarRange className="size-4" />
        {periodo.chave === "custom" ? (
          <>
            <Input
              type="date"
              value={de}
              onChange={(e) => setDe(e.target.value)}
              className="h-9 w-auto"
              aria-label="Data inicial"
            />
            até
            <Input
              type="date"
              value={ate}
              onChange={(e) => setAte(e.target.value)}
              className="h-9 w-auto"
              aria-label="Data final"
            />
            <Button size="sm" onClick={() => ir({ periodo: "custom", de, ate })}>
              Aplicar
            </Button>
          </>
        ) : (
          <span>
            {formatData(`${periodo.de}T12:00:00`)} a {formatData(`${periodo.ate}T12:00:00`)}
          </span>
        )}
      </div>
    </div>
  )
}
