import { TreePine } from "lucide-react"

import { siteConfig } from "@/config/site"

// Placeholder: a landing page animada é construída na Fase 10.
export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <TreePine className="text-floresta size-12" aria-hidden />
      <h1 className="font-heading text-primary text-4xl font-semibold">{siteConfig.nome}</h1>
      <p className="text-muted-foreground max-w-md">{siteConfig.slogan}</p>
      <p className="text-muted-foreground text-sm">Sistema em construção.</p>
    </main>
  )
}
