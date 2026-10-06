import { TreePine } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { siteConfig } from "@/config/site"

import { LoginForm } from "./login-form"

export const metadata: Metadata = { title: "Entrar", robots: { index: false } }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ proximo?: string }>
}) {
  const { proximo } = await searchParams

  return (
    <main className="bg-secondary relative flex min-h-dvh items-center justify-center overflow-hidden p-4">
      {/* Veios de madeira em SVG próprio */}
      <svg
        aria-hidden
        className="text-primary/10 absolute inset-0 size-full"
        preserveAspectRatio="none"
        viewBox="0 0 400 400"
      >
        {Array.from({ length: 14 }, (_, i) => (
          <path
            key={i}
            d={`M0 ${i * 30 + 10} C 100 ${i * 30 - 10}, 200 ${i * 30 + 35}, 400 ${i * 30 + 5}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          />
        ))}
      </svg>
      <Card className="relative w-full max-w-sm shadow-xl">
        <CardHeader className="text-center">
          <Link
            href="/"
            className="bg-primary text-primary-foreground mx-auto mb-2 flex size-12 items-center justify-center rounded-full"
          >
            <TreePine className="size-6" aria-hidden />
            <span className="sr-only">Voltar ao site</span>
          </Link>
          <CardTitle className="font-heading text-2xl">{siteConfig.nome}</CardTitle>
          <CardDescription>Área restrita — entre com seu usuário</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm proximo={proximo} />
        </CardContent>
      </Card>
    </main>
  )
}
