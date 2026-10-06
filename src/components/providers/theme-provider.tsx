"use client"

import { MotionConfig } from "framer-motion"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ComponentProps } from "react"

/** Tema claro/escuro + animações que respeitam "reduzir movimento" do sistema. */
export function ThemeProvider({ children, ...props }: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </NextThemesProvider>
  )
}
