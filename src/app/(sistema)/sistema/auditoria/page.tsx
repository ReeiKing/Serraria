import { sql } from "drizzle-orm"

import { FiltroPeriodo } from "@/components/painel/filtro-periodo"
import { CabecalhoPagina } from "@/components/sistema/cabecalho-pagina"
import { comUsuario } from "@/db"
import { resolverPeriodo } from "@/lib/periodo"

import { ListaAuditoria, type RegistroAuditoria } from "./lista"

export const metadata = { title: "Auditoria" }

export default async function AuditoriaPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string; de?: string; ate?: string }>
}) {
  const periodo = resolverPeriodo({ periodo: "30d", ...(await searchParams) })
  const registros = await comUsuario((tx) =>
    tx.execute<RegistroAuditoria>(sql`
      select a.id, a.tabela, a.registro_id, a.acao, a.created_at, u.nome as usuario, a.dados_antes, a.dados_depois
        from public.auditoria a left join public.usuarios u on u.id = a.usuario_id
       where (a.created_at at time zone 'America/Sao_Paulo')::date between ${periodo.de}::date and ${periodo.ate}::date
       order by a.created_at desc, a.id desc
       limit 1000`)
  )
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <CabecalhoPagina
        titulo="Auditoria"
        descricao="Quem criou, alterou ou excluiu cada registro, e quando. Somente leitura."
      />
      <FiltroPeriodo periodo={periodo} />
      <ListaAuditoria registros={registros} />
    </div>
  )
}
