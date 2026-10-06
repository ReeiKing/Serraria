import type { Metadata } from "next"
import Link from "next/link"

import { Marca } from "@/components/marca"
import { AlternarTema } from "@/components/sistema/alternar-tema"
import { MenuLateral } from "@/components/sistema/menu-lateral"
import { MenuMobile } from "@/components/sistema/menu-mobile"
import { MenuUsuario } from "@/components/sistema/menu-usuario"
import { TransicaoPagina } from "@/components/sistema/transicao-pagina"
import { siteConfig } from "@/config/site"
import { comUsuario, orcamentosSite } from "@/db"
import { eq, sql } from "drizzle-orm"
import { exigirUsuario } from "@/lib/auth/sessao"

export const metadata: Metadata = {
  title: { default: "Sistema", template: `%s · ${siteConfig.nomeCurto}` },
  robots: { index: false },
}

export default async function SistemaLayout({ children }: { children: React.ReactNode }) {
  const usuario = await exigirUsuario()
  const [{ novos }] = await comUsuario((tx) =>
    tx
      .select({ novos: sql<number>`count(*)::int` })
      .from(orcamentosSite)
      .where(eq(orcamentosSite.status, "novo"))
  )
  const contadores = { orcamentos: novos }

  return (
    <div className="flex min-h-dvh">
      <aside className="bg-sidebar sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-6 border-r p-4 lg:flex">
        <Link href="/sistema" className="flex items-center gap-2 px-2 pt-1">
          <Marca className="size-9" />
          <span className="font-heading text-lg leading-tight font-semibold">
            {siteConfig.nome}
          </span>
        </Link>
        <MenuLateral contadores={contadores} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-background/80 sticky top-0 z-30 flex h-14 items-center gap-2 border-b px-4 backdrop-blur">
          <MenuMobile nomeEmpresa={siteConfig.nome} contadores={contadores} />
          <Link href="/sistema" className="flex items-center gap-2 lg:hidden" aria-label="Painel">
            <Marca className="size-8 rounded-lg" />
            <span className="font-heading font-semibold">{siteConfig.nomeCurto}</span>
          </Link>
          <div className="ml-auto flex items-center gap-1">
            <AlternarTema />
            <MenuUsuario nome={usuario.nome} email={usuario.email} />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <TransicaoPagina>{children}</TransicaoPagina>
        </main>
      </div>
    </div>
  )
}
