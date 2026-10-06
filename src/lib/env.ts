import "server-only"

import { z } from "zod"

const schema = z.object({
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  SUPABASE_SECRET_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NFE_AMBIENTE: z.enum(["homologacao", "producao"]).default("homologacao"),
  NFE_PROVIDER: z.enum(["focus", "nuvemfiscal", "plugnotas", "nfeio", "sefaz"]).default("focus"),
  FOCUS_NFE_TOKEN: z.string().optional(),
  NFE_WEBHOOK_SECRET: z.string().optional(),
})

type Env = z.infer<typeof schema>

let cache: Env | undefined

/** Variáveis de ambiente do servidor, validadas na primeira leitura. */
export const env = new Proxy({} as Env, {
  get(_, key: string) {
    if (!cache) {
      const parsed = schema.safeParse(process.env)
      if (!parsed.success) {
        const campos = parsed.error.issues.map((i) => i.path.join(".")).join(", ")
        throw new Error(
          `Variáveis de ambiente inválidas ou ausentes: ${campos}. Veja .env.example.`
        )
      }
      cache = parsed.data
    }
    return cache[key as keyof Env]
  },
})
