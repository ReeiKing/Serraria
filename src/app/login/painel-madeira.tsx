"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Boxes, FileText, Truck } from "lucide-react"

import { AneisTora, SerraCircular, Serragem, VeiosMadeira } from "@/components/site/textura-madeira"

const RECURSOS = [
  { icone: Truck, texto: "Entradas de toras e cargas" },
  { icone: Boxes, texto: "Estoque por bitola e qualidade" },
  { icone: FileText, texto: "Romaneio e NF-e" },
]

export function PainelMadeira({ nome, slogan }: { nome: string; slogan: string }) {
  const reduzir = useReducedMotion()

  return (
    <section className="relative isolate hidden overflow-hidden bg-gradient-to-br from-stone-950 via-[#2a1709] to-[#5a3014] p-12 text-amber-50 lg:flex lg:flex-col">
      <VeiosMadeira className="-z-10 text-amber-700/40" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_70%,rgba(217,119,6,0.3),transparent_55%)]"
      />
      <Serragem quantidade={24} />

      <motion.div
        initial={reduzir ? false : { opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="font-heading text-2xl font-semibold">{nome}</span>
        <p className="text-sm text-amber-200/70">Sistema de gestão da serraria</p>
      </motion.div>

      {/* tora sendo "serrada": a lâmina gira e desce sobre a tora */}
      <div className="relative mx-auto my-auto aspect-square w-full max-w-md">
        <motion.div
          className="absolute inset-[12%] drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)]"
          initial={reduzir ? false : { scale: 0.5, opacity: 0, rotate: -40 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <AneisTora className="size-full" />
        </motion.div>
        <motion.div
          className="absolute top-0 left-1/2 w-[46%] -translate-x-1/2 drop-shadow-[0_20px_30px_rgba(0,0,0,0.6)]"
          initial={reduzir ? false : { y: -260, opacity: 0 }}
          animate={reduzir ? { opacity: 1 } : { y: [-260, -30, -50, -30], opacity: 1 }}
          transition={{ duration: 2.2, delay: 0.5, times: [0, 0.55, 0.8, 1], ease: "easeOut" }}
        >
          <SerraCircular className="size-full" velocidade={1.6} />
        </motion.div>
        {/* faíscas de serragem saindo do corte */}
        {!reduzir &&
          Array.from({ length: 10 }, (_, i) => (
            <motion.span
              key={i}
              className="absolute top-[26%] left-1/2 size-1.5 rounded-full bg-amber-300"
              animate={{
                x: [0, (i % 2 ? 1 : -1) * (40 + i * 12)],
                y: [0, -20 - (i % 4) * 18, 40],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: 2.4 + i * 0.12,
                ease: "easeOut",
              }}
            />
          ))}
      </div>

      <div className="flex flex-col gap-6">
        <motion.p
          className="font-heading max-w-md text-3xl leading-tight font-semibold text-balance"
          initial={reduzir ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
        >
          {slogan}
        </motion.p>
        <motion.ul
          className="flex flex-wrap gap-3"
          initial="o"
          animate="v"
          variants={{ v: { transition: { staggerChildren: 0.12, delayChildren: 0.8 } } }}
        >
          {RECURSOS.map(({ icone: Icone, texto }) => (
            <motion.li
              key={texto}
              variants={{ o: { opacity: 0, y: 12 }, v: { opacity: 1, y: 0 } }}
              className="flex items-center gap-2 rounded-full border border-amber-200/20 bg-amber-100/10 px-3 py-1.5 text-sm backdrop-blur"
            >
              <Icone className="size-4 text-amber-300" />
              {texto}
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}

/** Versão compacta do painel para o celular: faixa de madeira com a serra girando. */
export function FaixaMadeira({ nome }: { nome: string }) {
  const reduzir = useReducedMotion()
  return (
    <section className="relative isolate overflow-hidden rounded-b-[2rem] bg-gradient-to-br from-stone-950 via-[#2a1709] to-[#5a3014] px-6 pt-8 pb-10 text-amber-50 lg:hidden">
      <VeiosMadeira className="-z-10 text-amber-700/40" linhas={12} />
      <Serragem quantidade={10} />
      <div className="flex items-center gap-4">
        <div className="relative size-20 shrink-0">
          <motion.div
            className="absolute inset-0"
            initial={reduzir ? false : { scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <AneisTora className="size-full" aneis={6} />
          </motion.div>
          <motion.div
            className="absolute -top-3 -right-4 w-12"
            initial={reduzir ? false : { x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <SerraCircular className="size-full" velocidade={1.8} />
          </motion.div>
        </div>
        <motion.div
          initial={reduzir ? false : { opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="font-heading text-xl font-semibold">{nome}</div>
          <div className="text-sm text-amber-200/75">Sistema de gestão da serraria</div>
        </motion.div>
      </div>
    </section>
  )
}
