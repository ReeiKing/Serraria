import { config } from "dotenv"
import { defineConfig } from "drizzle-kit"

config({ path: ".env.local" })

export default defineConfig({
  schema: "./src/db/gerado/schema.ts",
  // Fonte da verdade: supabase/migrations (SQL). O Drizzle apenas introspecta (npm run db:pull).
  out: "./src/db/gerado",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "" },
  // Tabelas de auth/storage são do Supabase; o Drizzle só gerencia o schema public.
  schemaFilter: ["public"],
  strict: true,
  verbose: true,
})
