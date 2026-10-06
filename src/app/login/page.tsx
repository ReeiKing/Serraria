import type { Metadata } from "next"

import { siteConfig } from "@/config/site"

import { LoginForm } from "./login-form"
import { FaixaMadeira, PainelMadeira } from "./painel-madeira"

export const metadata: Metadata = { title: "Entrar", robots: { index: false } }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ proximo?: string }>
}) {
  const { proximo } = await searchParams

  return (
    <main className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <PainelMadeira nome={siteConfig.nome} slogan={siteConfig.slogan} />
      <div className="bg-background flex flex-col">
        <FaixaMadeira nome={siteConfig.nome} />
        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
          <LoginForm proximo={proximo} />
        </div>
      </div>
    </main>
  )
}
