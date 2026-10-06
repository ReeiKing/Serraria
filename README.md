# Madeireira — Gestão de Serraria + Site

Sistema web para serraria de **Pinus** e **Eucalipto**: compra de toras, produção de madeira serrada,
estoque, vendas com romaneio de carga e emissão de NF-e, além de uma landing page pública.

> Status: **Fase 1 — setup** concluída. As próximas fases estão no fim deste arquivo.
> Por enquanto o projeto roda **somente na máquina local** (Supabase local, sem deploy).

## Stack

| Camada                   | Escolha                                                                                                  |
| ------------------------ | -------------------------------------------------------------------------------------------------------- |
| Framework                | Next.js 15 (App Router) + TypeScript estrito                                                             |
| UI                       | Tailwind CSS 4, shadcn/ui (Radix), lucide-react, Framer Motion                                           |
| Banco / Auth / Arquivos  | PostgreSQL via Supabase (Auth + Storage para XML/PDF)                                                    |
| ORM                      | **Drizzle** — SQL-first e sem engine binária, convive bem com RLS, triggers e migrations SQL do Supabase |
| Formulários              | React Hook Form + Zod                                                                                    |
| Tabelas / Gráficos / PDF | TanStack Table, Recharts, @react-pdf/renderer                                                            |
| Datas e números          | date-fns + @date-fns/tz (America/Sao_Paulo), decimal.js                                                  |
| Testes                   | Vitest                                                                                                   |

## Requisitos

- Node.js 20.9+ (testado com 24)
- Para o banco local (a partir da Fase 2): Docker (Docker Desktop, OrbStack ou Colima) e a CLI do Supabase

## Como rodar

```bash
npm install
cp .env.example .env.local   # preencha as variáveis
npm run dev                  # http://localhost:3000
```

## Scripts

| Comando                                            | O que faz                    |
| -------------------------------------------------- | ---------------------------- |
| `npm run dev`                                      | Servidor de desenvolvimento  |
| `npm run build` / `start`                          | Build e servidor de produção |
| `npm run lint`                                     | ESLint                       |
| `npm run typecheck`                                | `tsc --noEmit`               |
| `npm test`                                         | Testes unitários (Vitest)    |
| `npm run check`                                    | lint + typecheck + testes    |
| `npm run format`                                   | Prettier                     |
| `npm run db:generate` / `db:migrate` / `db:studio` | Drizzle Kit                  |

## Estrutura

```
src/
  app/                 rotas (App Router) — landing em "/", sistema nas rotas logadas
  components/ui/       componentes shadcn/ui
  components/providers tema (claro/escuro) e afins
  config/site.ts       nome, textos e contatos da empresa (personalize aqui)
  db/                  conexão Drizzle, schema e migrations
  lib/
    env.ts             variáveis de ambiente validadas com Zod (somente servidor)
    format.ts          formatação brasileira (R$, vírgula decimal, datas no fuso de SP)
    supabase/          clientes Supabase (browser, servidor e middleware)
  middleware.ts        renovação da sessão do Supabase
```

## Convenções

- Interface 100% em português do Brasil.
- Moeda `R$ 1.234,56`, números com vírgula decimal, datas `dd/MM/yyyy HH:mm` no fuso America/Sao_Paulo
  (`src/lib/format.ts`). Campos numéricos aceitam vírgula (`1,8`) via `parseNumeroBR`.
- Segredos só em `.env.local` (nunca versionado). `.env.example` documenta cada variável.

## Fases

1. ✅ Setup
2. Banco e autenticação (schema, migrations, seed, RLS, login)
3. Cálculos (`lib/calculos.ts`) com testes
4. Cadastros
5. Entrada de toras
6. Produção e estoque
7. Vendas e romaneio (PDF)
8. NF-e via provedor (homologação)
9. Dashboard e relatórios
10. Landing page animada
11. Revisão final e documentação de deploy
