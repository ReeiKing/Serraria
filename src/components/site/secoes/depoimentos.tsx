"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"
import { useEffect, useState } from "react"

import { TituloSecao } from "@/components/site/revelar"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"

export function Depoimentos() {
  const lista = siteConfig.depoimentos
  const reduzir = useReducedMotion()
  const [[indice, direcao], setEstado] = useState<[number, number]>([0, 1])
  const [pausado, setPausado] = useState(false)

  const ir = (d: number) => setEstado(([i]) => [(i + d + lista.length) % lista.length, d])

  useEffect(() => {
    if (pausado || reduzir) return
    const t = setInterval(() => setEstado(([i]) => [(i + 1) % lista.length, 1]), 6000)
    return () => clearInterval(t)
  }, [pausado, reduzir, lista.length])

  const atual = lista[indice]!

  return (
    <section
      className="bg-background py-24"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
    >
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <TituloSecao selo="Depoimentos" titulo="Quem compra, volta" />
        <p className="text-alerta -mt-8 mb-8 text-center text-xs font-medium tracking-wide uppercase">
          Textos de exemplo — substitua por depoimentos reais em config/site.ts
        </p>

        <div
          className="bg-card relative min-h-64 overflow-hidden rounded-3xl border p-8 shadow-lg md:p-12"
          aria-live="polite"
        >
          <Quote className="text-primary/10 absolute top-6 right-6 size-16" />
          <AnimatePresence mode="wait" custom={direcao}>
            <motion.figure
              key={indice}
              custom={direcao}
              initial={reduzir ? false : { opacity: 0, x: direcao * 80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduzir ? undefined : { opacity: 0, x: direcao * -80 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <blockquote className="font-heading text-xl leading-relaxed text-pretty md:text-2xl">
                “{atual.texto}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="bg-primary text-primary-foreground flex size-11 items-center justify-center rounded-full font-semibold">
                  {atual.autor[0]}
                </span>
                <span>
                  <span className="block font-semibold">{atual.autor}</span>
                  <span className="text-muted-foreground block text-sm">{atual.cargo}</span>
                </span>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>

        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => ir(-1)}
            aria-label="Anterior"
            className="hover:bg-secondary flex size-11 items-center justify-center rounded-full border transition hover:-translate-x-0.5"
          >
            <ChevronLeft />
          </button>
          <div className="flex gap-2">
            {lista.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Depoimento ${i + 1}`}
                onClick={() => setEstado([i, i > indice ? 1 : -1])}
                className={cn(
                  "h-2.5 rounded-full transition-all",
                  i === indice ? "bg-primary w-8" : "bg-border hover:bg-primary/50 w-2.5"
                )}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => ir(1)}
            aria-label="Próximo"
            className="hover:bg-secondary flex size-11 items-center justify-center rounded-full border transition hover:translate-x-0.5"
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    </section>
  )
}
