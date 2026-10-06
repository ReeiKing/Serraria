"use client"

import { motion, useReducedMotion } from "framer-motion"
import type { ReactNode } from "react"

/** Surge de baixo para cima quando entra na tela. */
export function Revelar({
  children,
  atraso = 0,
  className,
}: {
  children: ReactNode
  atraso?: number
  className?: string
}) {
  const reduzir = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduzir ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: atraso, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function TituloSecao({
  selo,
  titulo,
  descricao,
  claro,
}: {
  selo: string
  titulo: ReactNode
  descricao?: string
  claro?: boolean
}) {
  return (
    <Revelar className="mx-auto mb-12 max-w-2xl text-center">
      <span
        className={`mb-3 inline-block rounded-full px-3 py-1 text-xs font-semibold tracking-wider uppercase ${claro ? "bg-amber-200/15 text-amber-200" : "bg-primary/10 text-primary"}`}
      >
        {selo}
      </span>
      <h2
        className={`font-heading text-3xl font-semibold text-balance md:text-5xl ${claro ? "text-amber-50" : ""}`}
      >
        {titulo}
      </h2>
      {descricao && (
        <p
          className={`mt-4 text-lg text-pretty ${claro ? "text-amber-100/70" : "text-muted-foreground"}`}
        >
          {descricao}
        </p>
      )}
    </Revelar>
  )
}
