"use client"

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion"
import { Check, RotateCw } from "lucide-react"
import { useState, type MouseEvent } from "react"

import { BotaoAnimado } from "@/components/site/botao-animado"
import { Revelar, TituloSecao } from "@/components/site/revelar"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"

type Produto = (typeof siteConfig.produtos)[number]

function CartaoProduto({ produto }: { produto: Produto }) {
  const reduzir = useReducedMotion()
  const [virado, setVirado] = useState(false)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [10, -10]), { stiffness: 200, damping: 20 })
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-12, 12]), { stiffness: 200, damping: 20 })

  function mover(e: MouseEvent<HTMLDivElement>) {
    if (reduzir) return
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5)
    my.set((e.clientY - r.top) / r.height - 0.5)
  }

  return (
    <div
      className="[perspective:1400px]"
      onMouseMove={mover}
      onMouseLeave={() => (mx.set(0), my.set(0))}
    >
      <motion.div
        style={{ rotateX: rx, rotateY: ry }}
        className="relative h-[460px] [transform-style:preserve-3d]"
      >
        <motion.div
          animate={{ rotateY: virado ? 180 : 0 }}
          transition={{ duration: reduzir ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative size-full [transform-style:preserve-3d]"
        >
          {/* frente */}
          <div className="bg-card absolute inset-0 flex flex-col overflow-hidden rounded-3xl border shadow-xl [backface-visibility:hidden]">
            <div className={cn("relative h-44 bg-gradient-to-br", produto.cor)}>
              <div
                aria-hidden
                className="absolute inset-0 opacity-50"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(100deg, rgba(120,53,15,0.25) 0 2px, transparent 2px 18px)",
                }}
              />
              <div className="absolute bottom-4 left-6 [transform:translateZ(40px)]">
                <h3 className="font-heading text-4xl font-semibold text-stone-900">
                  {produto.especie}
                </h3>
                <p className="text-sm text-stone-800/80 italic">{produto.cientifico}</p>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-4 p-6">
              <p className="text-muted-foreground">{produto.descricao}</p>
              <ul className="flex flex-col gap-2">
                {produto.usos.map((u) => (
                  <li key={u} className="flex items-center gap-2 text-sm">
                    <Check className="text-floresta size-4" /> {u}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => setVirado(true)}
                className="group text-primary mt-auto inline-flex items-center gap-2 self-start text-sm font-semibold"
              >
                <RotateCw className="size-4 transition-transform duration-500 group-hover:rotate-180" />
                Ver bitolas e qualidades
              </button>
            </div>
          </div>

          {/* verso */}
          <div className="absolute inset-0 flex [transform:rotateY(180deg)] flex-col gap-5 rounded-3xl border bg-gradient-to-br from-stone-900 to-[#3b200c] p-6 text-amber-50 shadow-xl [backface-visibility:hidden]">
            <h3 className="font-heading text-2xl font-semibold">
              {produto.especie} — bitolas comuns
            </h3>
            <div className="flex flex-wrap gap-2">
              {produto.bitolas.map((b, i) => (
                <motion.span
                  key={b}
                  initial={false}
                  animate={virado ? { scale: [0.8, 1], opacity: [0, 1] } : {}}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="rounded-full border border-amber-300/30 bg-amber-200/10 px-3 py-1 text-sm tabular-nums"
                >
                  {b}
                </motion.span>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              {siteConfig.qualidades.map((q, i) => (
                <div key={q.nome} className="flex gap-3">
                  <span className="font-heading flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-400 text-sm font-bold text-stone-900">
                    {i + 1}ª
                  </span>
                  <div>
                    <div className="font-semibold">{q.nome}</div>
                    <div className="text-sm text-amber-100/70">{q.descricao}</div>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setVirado(false)}
              className="group mt-auto inline-flex items-center gap-2 self-start text-sm font-semibold text-amber-300"
            >
              <RotateCw className="size-4 transition-transform duration-500 group-hover:-rotate-180" />
              Voltar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export function Produtos() {
  return (
    <section id="produtos" className="bg-secondary/60 scroll-mt-20 py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <TituloSecao
          selo="Produtos"
          titulo="Pinus e Eucalipto serrados"
          descricao="Vendidos por metro cúbico, em bitolas padrão ou sob medida. Gire o cartão para ver as medidas."
        />
        <div className="grid gap-8 md:grid-cols-2">
          {siteConfig.produtos.map((p, i) => (
            <Revelar key={p.especie} atraso={i * 0.15}>
              <CartaoProduto produto={p} />
            </Revelar>
          ))}
        </div>
        <Revelar className="mt-12 flex justify-center">
          <BotaoAnimado href="#contato" variante="floresta">
            Pedir orçamento da minha medida
          </BotaoAnimado>
        </Revelar>
      </div>
    </section>
  )
}
