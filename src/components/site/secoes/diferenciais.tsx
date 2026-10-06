"use client"

import { animate, motion, useInView, useReducedMotion } from "framer-motion"
import { useEffect, useRef, useState } from "react"

import { ICONES_SERRARIA } from "@/components/site/icones-animados"
import { Revelar, TituloSecao } from "@/components/site/revelar"
import { siteConfig } from "@/config/site"

function Contador({ valor, sufixo }: { valor: number; sufixo: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const visivel = useInView(ref, { once: true, amount: 0.6 })
  const reduzir = useReducedMotion()
  const [atual, setAtual] = useState(reduzir ? valor : 0)

  useEffect(() => {
    if (!visivel || reduzir) return
    const c = animate(0, valor, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setAtual(Math.round(v)),
    })
    return () => c.stop()
  }, [visivel, valor, reduzir])

  return (
    <span ref={ref} className="tabular-nums">
      {atual.toLocaleString("pt-BR")}
      {sufixo}
    </span>
  )
}

export function Diferenciais() {
  return (
    <section id="diferenciais" className="bg-background relative scroll-mt-20 py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <TituloSecao
          selo="Por que a gente"
          titulo="Da floresta à sua obra, com cuidado em cada etapa"
          descricao="Passe o mouse (ou toque) nos ícones."
        />

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {ICONES_SERRARIA.map((ic, i) => (
            <Revelar key={ic.id} atraso={i * 0.07}>
              <motion.div
                whileHover={{ y: -6 }}
                className="group bg-card hover:shadow-primary/10 flex h-full flex-col items-center gap-3 rounded-2xl border p-6 text-center shadow-sm transition-shadow hover:shadow-xl"
              >
                <span className="text-primary flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 transition-colors group-hover:from-amber-200 group-hover:to-orange-200 dark:from-amber-900/30 dark:to-orange-900/30">
                  {ic.render("size-8")}
                </span>
                <span className="text-sm font-semibold">{ic.rotulo}</span>
              </motion.div>
            </Revelar>
          ))}
        </div>

        <div className="from-primary text-primary-foreground mt-16 grid grid-cols-2 gap-6 rounded-3xl bg-gradient-to-br to-[#5a2f12] p-8 shadow-2xl md:grid-cols-4 md:p-12">
          {siteConfig.numeros.map((n, i) => (
            <Revelar key={n.rotulo} atraso={i * 0.1} className="text-center">
              <div className="font-heading text-3xl font-semibold whitespace-nowrap sm:text-4xl md:text-5xl">
                <Contador valor={n.valor} sufixo={n.sufixo} />
              </div>
              <div className="text-primary-foreground/75 mt-2 text-sm md:text-base">{n.rotulo}</div>
            </Revelar>
          ))}
        </div>
      </div>
    </section>
  )
}
