"use client"

import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion"
import dynamic from "next/dynamic"
import { ChevronDown, MessageCircle, ShieldCheck } from "lucide-react"
import { useRef } from "react"

import { BotaoAnimado } from "@/components/site/botao-animado"
import { Serragem, VeiosMadeira } from "@/components/site/textura-madeira"
import { linkWhatsApp, siteConfig } from "@/config/site"

// three.js só no navegador e carregado sob demanda (não pesa no primeiro carregamento)
const CenaSerraria = dynamic(() => import("@/components/site/cena-serraria"), {
  ssr: false,
  loading: () => <div className="size-full animate-pulse rounded-full bg-amber-900/20" />,
})

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
  const refArte = useRef<HTMLDivElement>(null)
  const arteVisivel = useInView(refArte, { margin: "100px" })
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

        {/* Arte 3D: tora sendo cortada pela serra circular */}
        <motion.div
          ref={refArte}
          style={{ y: yArte }}
          initial={reduzir ? false : { opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative mx-auto aspect-square w-full max-w-md lg:max-w-none"
        >
          <div
            aria-hidden
            className="absolute inset-[15%] rounded-full bg-orange-500/20 blur-3xl"
          />
          <div className="absolute inset-0 [mask-image:radial-gradient(closest-side,black_72%,transparent)]">
            <CenaSerraria movimento={!reduzir} ativo={arteVisivel} />
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
