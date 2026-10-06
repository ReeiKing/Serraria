import "server-only"

import { sql } from "drizzle-orm"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import { env } from "@/lib/env"
import { createClient } from "@/lib/supabase/server"

import * as relations from "./gerado/relations"
import * as schema from "./gerado/schema"

export * from "./gerado/schema"

// O pooler do Supabase em modo transaction não suporta prepared statements.
const globalForDb = globalThis as unknown as { pg?: ReturnType<typeof postgres> }
const client = globalForDb.pg ?? postgres(env.DATABASE_URL, { prepare: false, max: 10 })
if (process.env.NODE_ENV !== "production") globalForDb.pg = client

/**
 * Conexão com privilégio total (ignora RLS). Use só em rotinas de sistema sem usuário
 * (webhook do provedor de NF-e, orçamento do site). Para ações do usuário, use `comUsuario`.
 */
export const dbSistema = drizzle(client, { schema: { ...schema, ...relations } })

export type Tx = Parameters<Parameters<typeof dbSistema.transaction>[0]>[0]

export class SessaoExpiradaError extends Error {
  constructor() {
    super("Sua sessão expirou. Entre novamente.")
  }
}

/**
 * Executa `fn` numa transação com as permissões do usuário logado: o Postgres vê o
 * papel `authenticated` e o JWT, então as políticas de RLS e `auth.uid()` (carimbo de
 * created_by/updated_by e auditoria) valem exatamente como na Data API.
 */
export async function comUsuario<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims) throw new SessaoExpiradaError()

  return dbSistema.transaction(async (tx) => {
    await tx.execute(
      sql`select set_config('request.jwt.claims', ${JSON.stringify(data.claims)}, true)`
    )
    await tx.execute(sql`set local role authenticated`)
    return fn(tx)
  })
}
