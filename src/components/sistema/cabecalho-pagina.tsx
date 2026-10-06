import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

export function CabecalhoPagina({
  titulo,
  descricao,
  voltar,
  acoes,
}: {
  titulo: string
  descricao?: ReactNode
  voltar?: { href: string; rotulo: string }
  acoes?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {voltar && (
          <Link
            href={voltar.href}
            className="text-muted-foreground hover:text-foreground mb-1 inline-flex items-center gap-1 text-sm"
          >
            <ChevronLeft className="size-4" />
            {voltar.rotulo}
          </Link>
        )}
        <h1 className="font-heading text-2xl font-semibold md:text-3xl">{titulo}</h1>
        {descricao && <p className="text-muted-foreground mt-1">{descricao}</p>}
      </div>
      {acoes && <div className="flex flex-wrap gap-2">{acoes}</div>}
    </div>
  )
}
