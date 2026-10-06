"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function CartaoIndicador({
  titulo,
  valor,
  detalhe,
  icone,
  destaque,
  atraso = 0,
}: {
  titulo: string
  valor: ReactNode
  detalhe?: ReactNode
  /** Ícone já renderizado, ex.: <Truck /> (componentes não podem vir do servidor). */
  icone: ReactNode
  destaque?: boolean
  atraso?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: atraso }}
      whileHover={{ y: -3 }}
      className={cn(
        "flex flex-col gap-2 rounded-2xl border p-5 shadow-sm",
        destaque ? "from-primary text-primary-foreground bg-gradient-to-br to-[#5a2f12]" : "bg-card"
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "text-sm",
            destaque ? "text-primary-foreground/75" : "text-muted-foreground"
          )}
        >
          {titulo}
        </span>
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-lg [&_svg]:size-4.5",
            destaque ? "bg-white/15" : "bg-primary/10 text-primary"
          )}
        >
          {icone}
        </span>
      </div>
      <div className="font-heading text-2xl font-semibold tabular-nums md:text-3xl">{valor}</div>
      {detalhe && (
        <div
          className={cn(
            "text-xs",
            destaque ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          {detalhe}
        </div>
      )}
    </motion.div>
  )
}
