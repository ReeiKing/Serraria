import "server-only"

import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import { env } from "@/lib/env"

import * as schema from "./schema"

// O pooler do Supabase em modo transaction não suporta prepared statements.
const globalForDb = globalThis as unknown as { pg?: ReturnType<typeof postgres> }
const client = globalForDb.pg ?? postgres(env.DATABASE_URL, { prepare: false })
if (process.env.NODE_ENV !== "production") globalForDb.pg = client

export const db = drizzle(client, { schema })
