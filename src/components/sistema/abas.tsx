import Link from "next/link"

import { cn } from "@/lib/utils"

/** Abas como links (mantêm a escolha na URL). */
export function Abas({
  abas,
  atual,
}: {
  abas: { valor: string; rotulo: string; href: string }[]
  atual: string
}) {
  return (
    <nav className="bg-card flex gap-1 self-start rounded-xl border p-1">
      {abas.map((a) => (
        <Link
          key={a.valor}
          href={a.href}
          aria-current={a.valor === atual ? "page" : undefined}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            a.valor === atual
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          {a.rotulo}
        </Link>
      ))}
    </nav>
  )
}
