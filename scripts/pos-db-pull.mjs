// Ajusta o schema gerado pelo `drizzle-kit pull`: as FKs apontam para auth.users,
// que o pull não gera — usamos a definição oficial de drizzle-orm/supabase.
import { readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"

const dir = new URL("../src/db/gerado/", import.meta.url)
const cabecalho = `// ARQUIVO GERADO por \`npm run db:pull\` — não edite à mão.
// Fonte da verdade: supabase/migrations/*.sql
`

function reescrever(arquivo, ajuste = (s) => s) {
  const url = new URL(arquivo, dir)
  const conteudo = readFileSync(url, "utf8")
  if (conteudo.startsWith(cabecalho)) return
  writeFileSync(url, cabecalho + ajuste(conteudo))
}

reescrever("schema.ts", (s) =>
  s.replace(
    'import { sql } from "drizzle-orm"',
    'import { sql } from "drizzle-orm"\nimport { authUsers } from "drizzle-orm/supabase"\n\nconst users = authUsers\nexport const usersInAuth = authUsers'
  )
)
reescrever("relations.ts")

// O pull também gera uma migration e metadados que não usamos.
rmSync(new URL("meta", dir), { recursive: true, force: true })
for (const f of readdirSync(dir)) if (f.endsWith(".sql")) rmSync(new URL(f, dir))
