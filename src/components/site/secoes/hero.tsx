"use client"

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion"
import { ChevronDown, MessageCircle, ShieldCheck } from "lucide-react"
import { useRef } from "react"

import { BotaoAnimado } from "@/components/site/botao-animado"
import { AneisTora, SerraCircular, Serragem, VeiosMadeira } from "@/components/site/textura-madeira"
import { linkWhatsApp, siteConfig } from "@/config/site"

const cascata = {
  oculto: {},
  visivel: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
}
const item = {
  oculto: { opacity: 0, y: 30, filter: "blur(6px)" },
  visivel: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
}

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduzir = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })
  const yArte = useTransform(scrollYProgress, [0, 1], [0, reduzir ? 0 : 140])
  const opacidade = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const { hero } = siteConfig

  return (
    <section
      ref={ref}
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-gradient-to-br from-stone-950 via-[#2a1709] to-[#4a2810] pt-24 pb-16 text-amber-50"
    >
      <VeiosMadeira className="-z-10 text-amber-700/40" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_70%_40%,rgba(217,119,6,0.25),transparent_60%)]"
      />
      <Serragem />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 md:px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div
          variants={cascata}
          initial={reduzir ? false : "oculto"}
          animate="visivel"
          style={{ opacity: opacidade }}
        >
          <motion.span
            variants={item}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-amber-200/10 px-4 py-1.5 text-sm text-amber-200 backdrop-blur"
          >
            <ShieldCheck className="size-4" />
            {hero.selo}
          </motion.span>
          <motion.h1
            variants={item}
            className="font-heading text-4xl leading-[1.05] font-semibold text-balance sm:text-6xl lg:text-7xl"
          >
            {hero.titulo}{" "}
            <span className="relative inline-block bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500 bg-clip-text text-transparent">
              {hero.destaque}
              <motion.svg
                aria-hidden
                viewBox="0 0 300 20"
                className="absolute -bottom-2 left-0 w-full text-orange-500"
                preserveAspectRatio="none"
              >
                <motion.path
                  d="M2 14 C 80 4, 200 4, 298 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: 1, ease: "easeInOut" }}
                />
              </motion.svg>
            </span>{" "}
            {hero.complemento}
          </motion.h1>
          <motion.p
            variants={item}
            className="mt-6 max-w-xl text-lg text-pretty text-amber-100/75 md:text-xl"
          >
            {hero.subtitulo}
          </motion.p>
          <motion.div variants={item} className="mt-10 flex flex-col gap-3 sm:flex-row">
            <BotaoAnimado href="#contato">Solicitar orçamento</BotaoAnimado>
            <BotaoAnimado href="#produtos" variante="contorno" className="text-amber-50">
              Ver produtos
            </BotaoAnimado>
          </motion.div>
          <motion.a
            variants={item}
            href={linkWhatsApp()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-sm text-amber-200/80 underline-offset-4 hover:text-amber-100 hover:underline"
          >
            <MessageCircle className="size-4" /> Prefere conversar? Chame no WhatsApp
          </motion.a>
        </motion.div>

        {/* Arte: tora com anéis + serra girando + tábuas */}
        <motion.div
          style={{ y: yArte }}
          className="relative mx-auto aspect-square w-full max-w-md lg:max-w-lg"
        >
          <motion.div
            initial={reduzir ? false : { scale: 0.6, opacity: 0, rotate: -30 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-[8%] drop-shadow-[0_30px_60px_rgba(0,0,0,0.55)]"
          >
            <AneisTora className="size-full" />
          </motion.div>
          <motion.div
            initial={reduzir ? false : { x: 120, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
            className="absolute -top-2 -right-2 w-[42%] drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)]"
          >
            <SerraCircular className="size-full" velocidade={3} />
          </motion.div>
          {/* tábuas empilhadas */}
          <div className="absolute -bottom-4 -left-4 flex w-[62%] flex-col gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={reduzir ? false : { x: -160, opacity: 0 }}
                animate={{ x: i * 14, opacity: 1 }}
                transition={{ duration: 0.8, delay: 1 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="h-7 rounded-md border border-amber-900/40 bg-gradient-to-b from-amber-300 to-amber-500 shadow-xl"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(90deg, rgba(120,53,15,0.18) 0 2px, transparent 2px 22px), linear-gradient(to bottom, #fcd34d, #d97706)",
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      <motion.a
        href="#diferenciais"
        aria-label="Rolar para baixo"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-amber-200/70"
        animate={reduzir ? undefined : { y: [0, 8, 0] }}
        transition={{ duration: 1.6, repeat: Infinity }}
      >
        <ChevronDown className="size-7" />
      </motion.a>
    </section>
  )
}
