import type { Metadata } from "next"
import { Fraunces, Geist_Mono, Manrope } from "next/font/google"

import { ThemeProvider } from "@/components/providers/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { siteConfig } from "@/config/site"

import "./globals.css"

const sans = Manrope({ variable: "--font-sans", subsets: ["latin"] })
const heading = Fraunces({ variable: "--font-heading", subsets: ["latin"] })
const mono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.nome, template: `%s · ${siteConfig.nome}` },
  description: siteConfig.descricao,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${sans.variable} ${heading.variable} ${mono.variable}`}
    >
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
