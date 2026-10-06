"use client"

import { motion, useReducedMotion, type TargetAndTransition, type Variants } from "framer-motion"
import { Award, Ruler, Truck, TreePine } from "lucide-react"
import type { ComponentType, ReactNode } from "react"

import { cn } from "@/lib/utils"

type Anim = "giro" | "pulo" | "balanco" | "avanco" | "regua"

const hover: Record<Anim, TargetAndTransition> = {
  giro: { rotate: 360, transition: { duration: 0.8, ease: "easeInOut" } },
  pulo: { y: [0, -10, 0, -5, 0], transition: { duration: 0.7 } },
  balanco: { rotate: [0, -12, 10, -6, 0], transition: { duration: 0.8 } },
  avanco: { x: [0, 10, -3, 0], transition: { duration: 0.7 } },
  regua: { scaleX: [1, 1.18, 1], transition: { duration: 0.6 } },
}

/** Ícone lucide com animação de hover. */
export function IconeAnimado({
  icone: Icone,
  anim,
  className,
}: {
  icone: ComponentType<{ className?: string; strokeWidth?: number }>
  anim: Anim
  className?: string
}) {
  const reduzir = useReducedMotion()
  return (
    <motion.span
      className={cn("inline-flex", className)}
      whileHover={reduzir ? undefined : hover[anim]}
    >
      <Icone className="size-full" strokeWidth={1.6} />
    </motion.span>
  )
}

/** Desenha o traço do SVG (pathLength) quando entra na tela. */
function SvgDesenhado({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      initial="oculto"
      whileInView="visivel"
      viewport={{ once: true, amount: 0.6 }}
      whileHover="hover"
    >
      {children}
    </motion.svg>
  )
}

const traco: Variants = {
  oculto: { pathLength: 0, opacity: 0 },
  visivel: (i: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.9, delay: i * 0.15, ease: "easeInOut" as const },
  }),
  hover: { pathLength: [0, 1], transition: { duration: 0.7 } },
}

/** Tora (cilindro com anéis) — desenhada no traço. */
export function IconeTora({ className }: { className?: string }) {
  return (
    <SvgDesenhado className={className}>
      <motion.ellipse cx="6" cy="12" rx="3.5" ry="6" variants={traco} custom={0} />
      <motion.path d="M6 6h12a3.5 6 0 0 1 0 12H6" variants={traco} custom={1} />
      <motion.ellipse cx="6" cy="12" rx="1.5" ry="2.8" variants={traco} custom={2} />
      <motion.path d="M11 9.5h5M12 14.5h4" variants={traco} custom={3} />
    </SvgDesenhado>
  )
}

/** Serra circular — desenhada no traço e gira no hover. */
export function IconeSerra({ className }: { className?: string }) {
  const reduzir = useReducedMotion()
  return (
    <motion.span
      className={cn("inline-flex", className)}
      whileHover={reduzir ? undefined : { rotate: 180, transition: { duration: 0.6 } }}
    >
      <SvgDesenhado className="size-full">
        <motion.path
          d="M12 2l1.5 2.2 2.5-.9.4 2.6 2.6.4-.9 2.5L20.3 10l-2.2 1.5.9 2.5-2.6.4-.4 2.6-2.5-.9L12 18.3l-1.5-2.2-2.5.9-.4-2.6-2.6-.4.9-2.5L3.7 10l2.2-1.5-.9-2.5 2.6-.4.4-2.6 2.5.9z"
          variants={traco}
          custom={0}
        />
        <motion.circle cx="12" cy="10" r="2.5" variants={traco} custom={1} />
        <motion.path d="M4 21h16" variants={traco} custom={2} />
      </SvgDesenhado>
    </motion.span>
  )
}

/** Palete visto em perspectiva — tábuas e blocos desenhados no traço. */
export function IconePalete({ className = "size-8" }: { className?: string }) {
  return (
    <SvgDesenhado className={className}>
      <motion.path d="M3 9h18M3 12h18" variants={traco} custom={0} />
      <motion.path d="M4 12v4M12 12v4M20 12v4" variants={traco} custom={1} />
      <motion.path d="M3 16h18M3 19h18" variants={traco} custom={2} />
      <motion.path d="M6 6.5h12" variants={traco} custom={3} />
    </SvgDesenhado>
  )
}

/** Caixote de feira — ripas laterais e alças. */
export function IconeCaixote({ className = "size-8" }: { className?: string }) {
  return (
    <SvgDesenhado className={className}>
      <motion.path d="M3 8h18v11H3z" variants={traco} custom={0} />
      <motion.path d="M3 12h18M3 15.5h18" variants={traco} custom={1} />
      <motion.path d="M9 10h6" variants={traco} custom={2} />
      <motion.path d="M5 8V5h14v3" variants={traco} custom={3} />
    </SvgDesenhado>
  )
}

export const ICONES_SERRARIA = [
  {
    id: "arvore",
    rotulo: "Floresta plantada",
    render: (c: string) => <IconeAnimado icone={TreePine} anim="balanco" className={c} />,
  },
  { id: "tora", rotulo: "Toras selecionadas", render: (c: string) => <IconeTora className={c} /> },
  { id: "serra", rotulo: "Serragem precisa", render: (c: string) => <IconeSerra className={c} /> },
  {
    id: "regua",
    rotulo: "Bitola na medida",
    render: (c: string) => <IconeAnimado icone={Ruler} anim="regua" className={c} />,
  },
  {
    id: "selo",
    rotulo: "Qualidade classificada",
    render: (c: string) => <IconeAnimado icone={Award} anim="giro" className={c} />,
  },
  {
    id: "caminhao",
    rotulo: "Entrega no prazo",
    render: (c: string) => <IconeAnimado icone={Truck} anim="avanco" className={c} />,
  },
]
