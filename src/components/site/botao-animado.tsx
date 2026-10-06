"use client"

import { motion, useReducedMotion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { useState, type MouseEvent, type ReactNode } from "react"

import { cn } from "@/lib/utils"

type Variante = "primario" | "contorno" | "claro" | "floresta"

const estilos: Record<Variante, string> = {
  primario:
    "bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40",
  floresta:
    "bg-floresta text-floresta-foreground shadow-lg shadow-floresta/30 hover:shadow-xl hover:shadow-floresta/40",
  contorno: "border-2 border-current bg-transparent text-foreground hover:bg-foreground/5",
  claro: "bg-white/95 text-stone-900 shadow-lg hover:bg-white",
}

type Onda = { id: number; x: number; y: number }

/**
 * Botão com brilho deslizante, escala no hover, ripple no clique e seta que avança.
 * Vira <Link> quando recebe `href`.
 */
export function BotaoAnimado({
  children,
  href,
  onClick,
  type = "button",
  variante = "primario",
  seta = true,
  icone,
  className,
  disabled,
  externo,
}: {
  children: ReactNode
  href?: string
  onClick?: () => void
  type?: "button" | "submit"
  variante?: Variante
  seta?: boolean
  icone?: ReactNode
  className?: string
  disabled?: boolean
  externo?: boolean
}) {
  const reduzir = useReducedMotion()
  const [ondas, setOndas] = useState<Onda[]>([])

  function criarOnda(e: MouseEvent<HTMLElement>) {
    if (reduzir) return
    const r = e.currentTarget.getBoundingClientRect()
    const onda = { id: Date.now(), x: e.clientX - r.left, y: e.clientY - r.top }
    setOndas((o) => [...o, onda])
    setTimeout(() => setOndas((o) => o.filter((x) => x.id !== onda.id)), 650)
  }

  const conteudo = (
    <>
      {/* brilho deslizante */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-full w-1/2 skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-none group-hover:left-[150%] group-hover:transition-[left] group-hover:duration-700"
      />
      {ondas.map((o) => (
        <motion.span
          key={o.id}
          aria-hidden
          className="pointer-events-none absolute size-4 rounded-full bg-white/50"
          style={{ left: o.x - 8, top: o.y - 8 }}
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 18, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      ))}
      {icone && <span className="relative">{icone}</span>}
      <span className="relative">{children}</span>
      {seta && (
        <ArrowRight
          aria-hidden
          className="relative size-5 transition-transform duration-300 group-hover:translate-x-1.5"
        />
      )}
    </>
  )

  const classes = cn(
    "group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-full px-7 text-base font-semibold transition-[box-shadow,background-color] duration-300 focus-visible:ring-4 focus-visible:ring-ring/40 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60",
    estilos[variante],
    className
  )

  const animacao = reduzir ? {} : { whileHover: { scale: 1.04 }, whileTap: { scale: 0.97 } }

  if (href) {
    return (
      <motion.span className="inline-flex" {...animacao}>
        <Link
          href={href}
          className={classes}
          onClick={(e) => {
            criarOnda(e)
            onClick?.()
          }}
          {...(externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {conteudo}
        </Link>
      </motion.span>
    )
  }

  return (
    <motion.button
      type={type}
      disabled={disabled}
      className={classes}
      onClick={(e) => {
        criarOnda(e)
        onClick?.()
      }}
      {...animacao}
    >
      {conteudo}
    </motion.button>
  )
}
