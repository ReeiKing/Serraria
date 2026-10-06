"use client"

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion"
import { Factory, Layers, Ruler, TreePine, Truck } from "lucide-react"
import { useRef } from "react"

import { TituloSecao } from "@/components/site/revelar"
import { VeiosMadeira } from "@/components/site/textura-madeira"
import { siteConfig } from "@/config/site"

const ICONES = [TreePine, Ruler, Factory, Layers, Truck]

export function ComoFunciona() {
  const ref = useRef<HTMLDivElement>(null)
  const reduzir = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] })
  const progresso = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })

  return (
    <section
      id="como-funciona"
      className="relative isolate scroll-mt-20 overflow-hidden bg-stone-950 py-24 text-amber-50"
    >
      <VeiosMadeira className="-z-10 text-amber-900/40" linhas={16} />
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <TituloSecao
          claro
          selo="Como funciona"
          titulo="Da tora até a entrega"
          descricao="Cada etapa é registrada no nosso sistema — você recebe exatamente o que está no romaneio."
        />

        <div ref={ref} className="relative">
          {/* trilho e linha que se desenha com a rolagem */}
          <div className="absolute top-0 bottom-0 left-6 w-1 rounded-full bg-amber-100/10 md:left-1/2 md:-translate-x-1/2" />
          <motion.div
            className="absolute top-0 bottom-0 left-6 w-1 origin-top rounded-full bg-gradient-to-b from-amber-400 to-orange-600 md:left-1/2 md:-translate-x-1/2"
            style={{ scaleY: reduzir ? 1 : progresso }}
          />

          <ol className="flex flex-col gap-12">
            {siteConfig.etapas.map((etapa, i) => {
              const Icone = ICONES[i % ICONES.length]!
              const direita = i % 2 === 1
              return (
                <motion.li
                  key={etapa.titulo}
                  initial={reduzir ? false : { opacity: 0, x: direita ? 60 : -60 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative grid items-center gap-4 pl-20 md:grid-cols-2 md:pl-0 ${direita ? "md:[&>div]:col-start-2" : ""}`}
                >
                  <motion.span
                    whileInView={reduzir ? undefined : { scale: [0.4, 1.15, 1] }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="absolute top-1/2 left-6 z-10 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-stone-950 bg-gradient-to-br from-amber-400 to-orange-600 text-stone-950 shadow-lg shadow-orange-900/50 md:left-1/2"
                  >
                    <Icone className="size-5" />
                  </motion.span>
                  <div
                    className={`rounded-2xl border border-amber-100/10 bg-amber-50/5 p-6 backdrop-blur ${direita ? "md:ml-10" : "md:mr-10 md:text-right"}`}
                  >
                    <span className="text-xs font-semibold tracking-widest text-amber-400 uppercase">
                      Etapa {i + 1}
                    </span>
                    <h3 className="font-heading mt-1 text-2xl font-semibold">{etapa.titulo}</h3>
                    <p className="mt-2 text-amber-100/70">{etapa.descricao}</p>
                  </div>
                </motion.li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
