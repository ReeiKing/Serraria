"use client"

import { motion, useReducedMotion } from "framer-motion"
import { usePathname } from "next/navigation"

/** Entrada sutil de cada página da área logada. */
export function TransicaoPagina({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const reduzir = useReducedMotion()

  return (
    <motion.div
      key={pathname}
      initial={reduzir ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}
