"use client"

import { motion, useReducedMotion } from "framer-motion"

import { cn } from "@/lib/utils"

/** Arredonda coordenadas para o SVG sair idêntico no servidor e no navegador. */
const r2 = (n: number) => Math.round(n * 100) / 100

/** Veios de madeira desenhados em SVG (sem imagem), com ondulação lenta. */
export function VeiosMadeira({ className, linhas = 22 }: { className?: string; linhas?: number }) {
  const reduzir = useReducedMotion()
  const altura = 600
  const passo = altura / linhas

  return (
    <svg
      aria-hidden
      className={cn("absolute inset-0 size-full", className)}
      viewBox={`0 0 1200 ${altura}`}
      preserveAspectRatio="none"
    >
      {Array.from({ length: linhas }, (_, i) => {
        const y = i * passo + passo / 2
        const amp = 6 + ((i * 7) % 11)
        const d1 = `M-50 ${y} C 250 ${y - amp}, 450 ${y + amp * 1.6}, 700 ${y} S 1050 ${y - amp}, 1250 ${y + amp / 2}`
        const d2 = `M-50 ${y + amp / 3} C 250 ${y + amp}, 450 ${y - amp}, 700 ${y + amp / 2} S 1050 ${y + amp}, 1250 ${y - amp / 2}`
        return (
          <motion.path
            key={i}
            d={d1}
            fill="none"
            stroke="currentColor"
            strokeWidth={i % 4 === 0 ? 2.2 : 1}
            strokeOpacity={i % 4 === 0 ? 0.55 : 0.3}
            animate={reduzir ? undefined : { d: [d1, d2, d1] }}
            transition={{ duration: 14 + (i % 5) * 2, repeat: Infinity, ease: "easeInOut" }}
          />
        )
      })}
    </svg>
  )
}

/** Anéis de crescimento de uma tora vista de topo. */
export function AneisTora({
  className,
  aneis = 9,
  girar = true,
}: {
  className?: string
  aneis?: number
  girar?: boolean
}) {
  const reduzir = useReducedMotion()
  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 200 200"
      className={className}
      animate={girar && !reduzir ? { rotate: 360 } : undefined}
      transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
    >
      <defs>
        <radialGradient id="cerne" cx="48%" cy="52%" r="60%">
          <stop offset="0%" stopColor="#c8925a" />
          <stop offset="55%" stopColor="#e2b47f" />
          <stop offset="88%" stopColor="#d9a46b" />
          <stop offset="100%" stopColor="#7a4a26" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="96" fill="url(#cerne)" />
      <circle cx="100" cy="100" r="96" fill="none" stroke="#5b3519" strokeWidth="6" />
      {Array.from({ length: aneis }, (_, i) => {
        const r = 8 + i * (82 / aneis)
        return (
          <motion.ellipse
            key={i}
            cx={100 + (i % 2 ? 1.5 : -1.5)}
            cy={100 + (i % 3 ? 1 : -1)}
            rx={r}
            ry={r * 0.96}
            fill="none"
            stroke="#8b5a2b"
            strokeOpacity={0.35 + (i % 3) * 0.15}
            strokeWidth={i % 3 === 0 ? 2 : 1}
            initial={reduzir ? false : { pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.15 * i, ease: "easeOut" }}
          />
        )
      })}
      {/* rachaduras radiais */}
      {[20, 140, 250].map((a) => (
        <line
          key={a}
          x1="100"
          y1="100"
          x2={r2(100 + Math.cos((a * Math.PI) / 180) * 70)}
          y2={r2(100 + Math.sin((a * Math.PI) / 180) * 70)}
          stroke="#6b3f1d"
          strokeOpacity="0.35"
          strokeWidth="1.2"
        />
      ))}
    </motion.svg>
  )
}

/** Lâmina de serra circular girando. */
export function SerraCircular({
  className,
  velocidade = 6,
}: {
  className?: string
  velocidade?: number
}) {
  const reduzir = useReducedMotion()
  const dentes = 28
  const pontos = Array.from({ length: dentes * 2 }, (_, i) => {
    const ang = (i * Math.PI) / dentes
    const r = i % 2 === 0 ? 96 : 84
    const deslocamento = i % 2 === 0 ? 0.06 : 0
    return `${r2(100 + Math.cos(ang + deslocamento) * r)},${r2(100 + Math.sin(ang + deslocamento) * r)}`
  }).join(" ")

  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 200 200"
      className={className}
      animate={reduzir ? undefined : { rotate: 360 }}
      transition={{ duration: velocidade, repeat: Infinity, ease: "linear" }}
    >
      <defs>
        <linearGradient id="aco" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f5f5f4" />
          <stop offset="50%" stopColor="#a8a29e" />
          <stop offset="100%" stopColor="#e7e5e4" />
        </linearGradient>
      </defs>
      <polygon points={pontos} fill="url(#aco)" stroke="#57534e" strokeWidth="1.5" />
      <circle
        cx="100"
        cy="100"
        r="62"
        fill="none"
        stroke="#78716c"
        strokeOpacity="0.5"
        strokeWidth="1"
      />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <circle
          key={a}
          cx={r2(100 + Math.cos((a * Math.PI) / 180) * 42)}
          cy={r2(100 + Math.sin((a * Math.PI) / 180) * 42)}
          r="6"
          fill="#57534e"
          fillOpacity="0.35"
        />
      ))}
      <circle cx="100" cy="100" r="20" fill="#44403c" />
      <circle cx="100" cy="100" r="8" fill="#a8a29e" />
    </motion.svg>
  )
}

/** Partículas de serragem flutuando. */
export function Serragem({
  quantidade = 18,
  className,
}: {
  quantidade?: number
  className?: string
}) {
  const reduzir = useReducedMotion()
  if (reduzir) return null
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {Array.from({ length: quantidade }, (_, i) => {
        // pseudo-aleatório estável (mesmo resultado no servidor e no navegador)
        const s = Math.sin(i * 999) * 10000
        const r = s - Math.floor(s)
        return (
          <motion.span
            key={i}
            className="absolute rounded-full bg-amber-200/70"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${60 + r * 40}%`,
              width: 3 + r * 4,
              height: 3 + r * 4,
            }}
            animate={{
              y: [0, -260 - r * 200],
              x: [0, (r - 0.5) * 80],
              opacity: [0, 0.9, 0],
              rotate: [0, 180],
            }}
            transition={{ duration: 6 + r * 6, repeat: Infinity, delay: r * 6, ease: "easeOut" }}
          />
        )
      })}
    </div>
  )
}
