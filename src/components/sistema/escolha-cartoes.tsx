"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/** Grupo de botões grandes (bom para o celular no pátio). */
export function EscolhaCartoes<T extends string>({
  valor,
  opcoes,
  aoMudar,
  nome,
  colunas = 2,
}: {
  valor: T
  opcoes: { valor: T; rotulo: string; descricao?: string; icone?: ReactNode }[]
  aoMudar: (v: T) => void
  nome: string
  colunas?: 2 | 3
}) {
  return (
    <div
      role="radiogroup"
      aria-label={nome}
      className={cn("grid gap-3", colunas === 3 ? "sm:grid-cols-3" : "grid-cols-2")}
    >
      {opcoes.map((o) => {
        const ativo = o.valor === valor
        return (
          <button
            key={o.valor}
            type="button"
            role="radio"
            aria-checked={ativo}
            onClick={() => aoMudar(o.valor)}
            className={cn(
              "relative flex min-h-16 items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors",
              ativo
                ? "border-primary text-primary-foreground"
                : "border-border bg-card hover:border-primary/40"
            )}
          >
            {ativo && (
              <motion.span
                layoutId={`escolha-${nome}`}
                className="bg-primary absolute inset-0 rounded-[10px]"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            {o.icone && <span className="relative shrink-0">{o.icone}</span>}
            <span className="relative">
              <span className="block text-base font-semibold">{o.rotulo}</span>
              {o.descricao && (
                <span
                  className={cn(
                    "block text-xs",
                    ativo ? "text-primary-foreground/80" : "text-muted-foreground"
                  )}
                >
                  {o.descricao}
                </span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export function Secao({
  titulo,
  descricao,
  children,
  className,
}: {
  titulo: string
  descricao?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn("bg-card flex flex-col gap-4 rounded-2xl border p-4 md:p-6", className)}>
      <div>
        <h2 className="font-heading text-lg font-semibold">{titulo}</h2>
        {descricao && <p className="text-muted-foreground text-sm">{descricao}</p>}
      </div>
      {children}
    </section>
  )
}
