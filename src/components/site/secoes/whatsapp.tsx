"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useEffect, useState } from "react"

import { linkWhatsApp } from "@/config/site"

function LogoWhatsApp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.64-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35zM12.04 21.5h-.01a9.45 9.45 0 0 1-4.82-1.32l-.35-.2-3.58.94.96-3.49-.23-.36a9.44 9.44 0 0 1-1.45-5.03c0-5.22 4.25-9.47 9.48-9.47 2.53 0 4.91.99 6.7 2.78a9.4 9.4 0 0 1 2.77 6.7c0 5.22-4.25 9.46-9.47 9.46zm8.06-17.53A11.33 11.33 0 0 0 12.04.63C5.76.63.65 5.74.65 12.02c0 2 .52 3.96 1.52 5.69L.55 23.6l6.04-1.58a11.36 11.36 0 0 0 5.44 1.39h.01c6.28 0 11.39-5.11 11.39-11.39 0-3.04-1.19-5.9-3.33-8.05z" />
    </svg>
  )
}

/** Botão flutuante do WhatsApp com pulso e balão de chamada. */
export function WhatsAppFlutuante() {
  const reduzir = useReducedMotion()
  const [balao, setBalao] = useState(false)

  useEffect(() => {
    const abrir = setTimeout(() => setBalao(true), 4000)
    const fechar = setTimeout(() => setBalao(false), 12000)
    return () => (clearTimeout(abrir), clearTimeout(fechar))
  }, [])

  return (
    <div className="fixed right-5 bottom-5 z-50 flex items-center gap-3">
      <AnimatePresence>
        {balao && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className="hidden rounded-2xl rounded-br-sm bg-white px-4 py-2 text-sm font-medium text-stone-800 shadow-xl sm:block"
          >
            Precisa de um orçamento? 👋
          </motion.div>
        )}
      </AnimatePresence>
      <motion.a
        href={linkWhatsApp()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Conversar no WhatsApp"
        initial={reduzir ? false : { scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 1.5, type: "spring", stiffness: 200, damping: 14 }}
        whileHover={{ scale: 1.12, rotate: 8 }}
        whileTap={{ scale: 0.92 }}
        onHoverStart={() => setBalao(true)}
        className="relative flex size-16 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-green-900/30"
      >
        {!reduzir && (
          <>
            <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-30" />
            <span className="absolute -inset-1 animate-pulse rounded-full border-2 border-[#25D366]/50" />
          </>
        )}
        <LogoWhatsApp className="relative size-8" />
      </motion.a>
    </div>
  )
}
