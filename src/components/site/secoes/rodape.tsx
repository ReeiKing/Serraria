import { Lock } from "lucide-react"
import Link from "next/link"

import { Marca } from "@/components/marca"
import { siteConfig } from "@/config/site"

export function Rodape() {
  const ano = new Date().getFullYear()
  return (
    <footer className="bg-stone-950 py-12 text-amber-100/70">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 md:flex-row md:items-start md:justify-between md:px-6">
        <div className="max-w-sm">
          <div className="flex items-center gap-2 text-amber-50">
            <Marca className="size-9" />
            <span className="font-heading text-lg font-semibold">{siteConfig.nome}</span>
          </div>
          <p className="mt-3 text-sm">{siteConfig.descricao}</p>
        </div>
        <div className="text-sm">
          <div className="font-semibold text-amber-50">Contato</div>
          <p className="mt-2">{siteConfig.contato.telefone}</p>
          <p>{siteConfig.contato.email}</p>
          <p>
            {siteConfig.endereco.logradouro} · {siteConfig.endereco.municipio}/
            {siteConfig.endereco.uf}
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 self-start text-sm hover:text-amber-50"
        >
          <Lock className="size-4" /> Área restrita
        </Link>
      </div>
      <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 px-4 pt-6 text-xs md:px-6">
        © {ano} {siteConfig.nome}. Madeira de floresta plantada.
      </div>
    </footer>
  )
}
