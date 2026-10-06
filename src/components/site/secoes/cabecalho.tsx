"use client"

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion"
import { Lock, Menu, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { Marca } from "@/components/marca"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"

const LINKS = [
  { href: "#produtos", rotulo: "Produtos" },
  { href: "#diferenciais", rotulo: "Diferenciais" },
  { href: "#como-funciona", rotulo: "Como funciona" },
  { href: "#faq", rotulo: "Dúvidas" },
  { href: "#contato", rotulo: "Contato" },
]

export function Cabecalho() {
  const { scrollY } = useScroll()
  const [rolou, setRolou] = useState(false)
  const [aberto, setAberto] = useState(false)
  useMotionValueEvent(scrollY, "change", (y) => setRolou(y > 24))

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        rolou || aberto
          ? "border-b border-white/10 bg-stone-950/75 py-2 shadow-lg backdrop-blur-xl"
          : "bg-transparent py-4"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 md:px-6">
        <Link href="/" className="group flex items-center gap-2 text-amber-50">
          <motion.span
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.8 }}
            className="inline-flex"
          >
            <Marca />
          </motion.span>
          <span className="font-heading text-lg leading-none font-semibold">{siteConfig.nome}</span>
        </Link>

        <nav aria-label="Seções" className="ml-auto hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="group relative rounded-full px-4 py-2 text-sm font-medium text-amber-50/80 transition-colors hover:text-white"
            >
              {l.rotulo}
              <span className="absolute inset-x-4 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-amber-400 transition-transform duration-300 group-hover:scale-x-100" />
            </a>
          ))}
        </nav>

        <Link
          href="/login"
          className="group ml-auto hidden items-center gap-2 rounded-full border border-amber-200/30 px-4 py-2 text-sm font-semibold text-amber-50 transition-all hover:border-amber-300 hover:bg-amber-300 hover:text-stone-900 sm:inline-flex lg:ml-2"
        >
          <Lock className="size-4 transition-transform group-hover:-rotate-12" />
          Área restrita
        </Link>

        <button
          type="button"
          onClick={() => setAberto((a) => !a)}
          className="ml-auto flex size-10 items-center justify-center rounded-full text-amber-50 sm:ml-0 lg:hidden"
          aria-label={aberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={aberto}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={aberto ? "x" : "m"}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {aberto ? <X /> : <Menu />}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>

      <AnimatePresence>
        {aberto && (
          <motion.nav
            aria-label="Menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden lg:hidden"
          >
            <motion.ul
              className="flex flex-col gap-1 px-4 pt-4 pb-6"
              initial="f"
              animate="a"
              variants={{ a: { transition: { staggerChildren: 0.05 } } }}
            >
              {[...LINKS, { href: "/login", rotulo: "Área restrita" }].map((l) => (
                <motion.li
                  key={l.href}
                  variants={{ f: { x: -20, opacity: 0 }, a: { x: 0, opacity: 1 } }}
                >
                  <a
                    href={l.href}
                    onClick={() => setAberto(false)}
                    className="block rounded-xl px-4 py-3 text-lg font-medium text-amber-50 hover:bg-white/10"
                  >
                    {l.rotulo}
                  </a>
                </motion.li>
              ))}
            </motion.ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
