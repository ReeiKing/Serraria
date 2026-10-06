"use client"

import { animate, useInView, useReducedMotion } from "framer-motion"
import { useEffect, useRef, useState } from "react"

import { formatMoeda, formatNumero, formatPercentual } from "@/lib/format"

export type FormatoNumero = "moeda" | "m3" | "pct" | "inteiro"

const formatar: Record<FormatoNumero, (n: number) => string> = {
  moeda: (n) => formatMoeda(n),
  m3: (n) => `${formatNumero(n, 1, 1)} m³`,
  pct: (n) => formatPercentual(n),
  inteiro: (n) => Math.round(n).toLocaleString("pt-BR"),
}

/** Número que "conta" até o valor ao aparecer na tela. */
export function NumeroAnimado({
  valor,
  formato,
}: {
  valor: number | null
  formato: FormatoNumero
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const visivel = useInView(ref, { once: true })
  const reduzir = useReducedMotion()
  const [atual, setAtual] = useState(0)

  useEffect(() => {
    if (valor === null || !visivel) return
    if (reduzir) {
      setAtual(valor)
      return
    }
    const c = animate(0, valor, { duration: 1.2, ease: [0.16, 1, 0.3, 1], onUpdate: setAtual })
    return () => c.stop()
  }, [valor, visivel, reduzir])

  return (
    <span ref={ref} className="tabular-nums">
      {valor === null ? "—" : formatar[formato](visivel ? atual : 0)}
    </span>
  )
}
