# Madeireira — Gestão de Serraria + Site

Sistema web para serraria de **Pinus** e **Eucalipto**: compra de toras, produção de madeira serrada,
estoque, vendas com romaneio de carga e emissão de NF-e, além de uma landing page pública.

> Status: **Fases 1 e 2** concluídas (setup, banco e autenticação). As próximas fases estão no fim deste arquivo.
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
- Docker (OrbStack, Docker Desktop ou Colima) e a CLI do Supabase (`brew install supabase/tap/supabase`)

## Como rodar (local)

```bash
npm install
npm run db:start             # sobe o Supabase local (Docker) e aplica migrations + seed
cp .env.example .env.local   # use as chaves que o comando acima imprimir
npm run dev                  # http://localhost:3000  ·  login em /login
```

Serviços locais: Studio em http://127.0.0.1:54323 · e-mails de teste (Mailpit) em http://127.0.0.1:54324.

### Usuário de desenvolvimento (criado pelo seed)

E-mail **secretaria@madeireira.local** · senha **madeira123**

O cadastro público está desligado: usuários são criados pelo administrador.
`npm run db:reset` recria o banco do zero (migrations + seed).

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
  db/index.ts          conexão Drizzle e `comUsuario` (transação com RLS do usuário)
  db/gerado/           schema e relações Drizzle GERADOS do banco (não editar)
  lib/
    env.ts             variáveis de ambiente validadas com Zod (somente servidor)
    format.ts          formatação brasileira (R$, vírgula decimal, datas no fuso de SP)
    auth/              sessão e `exigirUsuario`
    supabase/          clientes Supabase (browser, servidor e middleware)
  middleware.ts        renova a sessão e protege /sistema
supabase/
  migrations/          SQL — fonte da verdade do banco (tabelas, gatilhos, RLS, storage)
  seed.sql             dados de desenvolvimento
  tests/               testes pgTAP
```

## Banco de dados e segurança

- **Migrations em SQL** (`supabase/migrations`) são a fonte da verdade; o Drizzle só introspecta
  (`npm run db:pull`) para ter tipos no TypeScript.
- Toda tabela tem `id` UUID, `created_at`/`updated_at` e `created_by`/`updated_by`, preenchidos
  **pelo banco** (gatilho `private.tg_carimbo`) — o usuário nunca digita data/hora de registro.
- **Auditoria**: gatilho em todas as tabelas de negócio grava antes/depois e o usuário em `auditoria`.
- **Estoque**: o saldo só muda por movimentação (`estoque_mov`), atualizado na mesma transação,
  com trava de linha; saldo negativo é bloqueado salvo confirmação explícita (`permitir_negativo`).
  O kardex é imutável.
- **Acesso único**: não há perfis com permissões diferentes — todo usuário ativo gerencia tudo
  (a operação é feita por uma secretária). O RLS está ligado em todas as tabelas e exige usuário
  logado e ativo; desativar um usuário corta o acesso dele na hora. Visitantes do site só podem
  enviar orçamentos.
- No servidor, as ações do usuário rodam com `comUsuario()`, que abre a transação com o papel
  `authenticated` e o JWT do usuário — o RLS vale também para as consultas via Drizzle.
  `dbSistema` (sem RLS) fica reservado a rotinas sem usuário, como webhooks.

## Convenções

- Interface 100% em português do Brasil.
- Moeda `R$ 1.234,56`, números com vírgula decimal, datas `dd/MM/yyyy HH:mm` no fuso America/Sao_Paulo
  (`src/lib/format.ts`). Campos numéricos aceitam vírgula (`1,8`) via `parseNumeroBR`.
- Segredos só em `.env.local` (nunca versionado). `.env.example` documenta cada variável.

## Fases

1. ✅ Setup
2. ✅ Banco e autenticação (schema, migrations, seed, RLS, login)
3. Cálculos (`lib/calculos.ts`) com testes
4. Cadastros
5. Entrada de toras
6. Produção e estoque
7. Vendas e romaneio (PDF)
8. NF-e via provedor (homologação)
9. Dashboard e relatórios
10. Landing page animada
11. Revisão final e documentação de deploy
