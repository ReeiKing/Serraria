import { CabecalhoPagina } from "@/components/sistema/cabecalho-pagina"
import { comUsuario, empresas } from "@/db"
import { createClient } from "@/lib/supabase/server"

import { FormularioEmpresa } from "./formulario"

export const metadata = { title: "Empresa e fiscal" }

export default async function EmpresaPage() {
  const [empresa] = await comUsuario((tx) => tx.select().from(empresas).limit(1))

  let logoUrl: string | null = null
  if (empresa?.logoPath) {
    const supabase = await createClient()
    const { data } = await supabase.storage.from("empresa").createSignedUrl(empresa.logoPath, 3600)
    logoUrl = data?.signedUrl ?? null
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <CabecalhoPagina
        titulo="Empresa e fiscal"
        descricao="Dados do emitente da NF-e. Os padrões fiscais são sugestões — confirme com o contador antes de emitir em produção."
        voltar={{ href: "/sistema/cadastros", rotulo: "Cadastros" }}
      />
      <FormularioEmpresa empresa={empresa ?? null} logoUrl={logoUrl} />
    </div>
  )
}
