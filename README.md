# Madeireira: gestão de serraria e site

Sistema web para serraria de **Pinus** e **Eucalipto** que cobre a compra de toras, a produção
de madeira serrada, o estoque, as vendas com romaneio de carga, os relatórios e uma landing page
pública. A emissão de NF-e está **pendente** e só será feita depois da aprovação do cliente
(o plano está em [NF-e](#nf-e-pendente)).

Por enquanto o projeto roda **só na máquina local**, com o Supabase local em Docker.

## O que o sistema faz

| Módulo             | Resumo                                                                                                                                                                                                                                                                      |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Painel             | Faturamento, m³ vendido e produzido, rendimento médio, toras compradas, pagamentos, contas a pagar e ticket médio por período; gráficos de compras × vendas, vendas por espécie e qualidade e estoque atual; avisos de estoque baixo, cargas a entregar e orçamentos novos. |
| Entrada de toras   | Compra por m³ (diâmetro e comprimento de cada tora, com quantidade por diâmetro), metro estéreo (C × L × A da carga) ou tonelada (bruto menos a tara do veículo). Preço sugerido pela tabela, pagamentos parciais ao fornecedor e baixa automática no estoque de toras.     |
| Produção           | Peças por linha (espessura × largura × comprimento, qualidade, quantidade), volume em tempo real, rendimento (m³ serrado ÷ m³ de tora) e estorno com movimentos inversos.                                                                                                   |
| Estoque            | Saldo por espécie + bitola + qualidade, valor estimado pelo preço vigente, busca por medida ("1,8 x 9"), estoque mínimo com alerta, ajuste manual com motivo e kardex por item.                                                                                             |
| Vendas e romaneio  | Cliente e destino da carga, itens escolhidos do estoque, frete CIF/FOB, desconto; rascunho → confirmada (baixa o estoque e gera o romaneio numerado) → entregue, com cancelamento que devolve as peças. Romaneio em PDF para imprimir ou baixar.                            |
| Orçamentos do site | Caixa de entrada dos pedidos feitos na landing, com status e resposta pelo WhatsApp.                                                                                                                                                                                        |
| Cadastros          | Clientes (preenchimento pelo CNPJ e CEP via BrasilAPI), fornecedores, motoristas, veículos, espécies e qualidades, tabela de preços com histórico, dados da empresa e padrões fiscais, usuários.                                                                            |
| Relatórios         | Compras, pagamentos, produção, vendas e estoque, com filtros e exportação para Excel e PDF.                                                                                                                                                                                 |
| Auditoria          | Quem criou, alterou ou excluiu cada registro e quando, com os valores antes e depois.                                                                                                                                                                                       |
| Landing page       | Hero com cena 3D (tora sendo serrada), produtos, diferenciais, linha do tempo, depoimentos, FAQ, formulário de orçamento e WhatsApp. Textos em `src/config/site.ts`.                                                                                                        |

Todo usuário logado e ativo tem acesso completo (a operação é feita por uma secretária); não há
perfis com permissões diferentes.

## Stack

| Camada                         | Escolha                                                                                                             |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Framework                      | Next.js 15 (App Router, Turbopack no dev) e TypeScript estrito                                                      |
| Interface                      | Tailwind CSS 4, shadcn/ui (Radix), lucide-react, Framer Motion                                                      |
| 3D da landing                  | three.js com React Three Fiber e drei                                                                               |
| Banco, login e arquivos        | PostgreSQL no Supabase (Auth, Storage, RLS)                                                                         |
| ORM                            | Drizzle, que é SQL-first e não usa engine binária, então convive bem com RLS, gatilhos e migrations SQL do Supabase |
| Formulários                    | React Hook Form e Zod (a mesma validação roda no navegador e no servidor)                                           |
| Tabelas, gráficos e documentos | TanStack Table 9, Recharts, @react-pdf/renderer, ExcelJS                                                            |
| Datas e números                | date-fns com @date-fns/tz (America/Sao_Paulo) e decimal.js                                                          |
| Testes                         | Vitest, pgTAP (`supabase test db`) e Playwright                                                                     |

## Como rodar

Requisitos: Node.js 20.9 ou superior, Docker (OrbStack, Docker Desktop ou Colima) e a CLI do
Supabase (`brew install supabase/tap/supabase`).

```bash
npm install
npm run db:start             # sobe o Supabase local e aplica migrations, seed e dados de simulação
cp .env.example .env.local   # preencha com as chaves que o comando acima imprime
npm run dev                  # http://localhost:3000
```

| Endereço                    | O que é                    |
| --------------------------- | -------------------------- |
| http://localhost:3000       | Site público               |
| http://localhost:3000/login | Entrada do sistema         |
| http://127.0.0.1:54323      | Supabase Studio (banco)    |
| http://127.0.0.1:54324      | Mailpit (e-mails de teste) |

### Usuários de desenvolvimento

| E-mail                      | Nome          | Senha      |
| --------------------------- | ------------- | ---------- |
| secretaria@madeireira.local | Secretária    | madeira123 |
| gerente@madeireira.local    | Carlos Mendes | madeira123 |

O cadastro público está desligado: novos usuários são criados em **Cadastros → Usuários**.

## Dados de simulação

O banco local já sobe preenchido como se o sistema estivesse em uso desde julho: 8 clientes,
5 fornecedores, 4 motoristas e 4 veículos, 18 entradas de toras nos três modos de medição,
22 produções, 28 vendas em todos os status, 26 romaneios, 14 orçamentos do site, histórico de
preços e a auditoria de tudo isso.

As datas são gravadas como `now() - intervalo`, então a última movimentação fica sempre a poucas
horas do momento em que o banco foi recriado e o painel de "Este mês" nunca fica vazio numa
apresentação. Para voltar ao estado original a qualquer momento:

```bash
npm run db:reset
```

Os dados vêm de `supabase/seeds/dados_exemplo.sql`, gerado por `scripts/gerar-dados-exemplo.ts`.
O gerador usa as mesmas funções de cálculo do sistema, por isso volumes, valores e saldos batem
com o que as telas calculariam. Depois de mudar o gerador, rode `npx tsx scripts/gerar-dados-exemplo.ts`
e `npm run db:reset`. Todos os nomes, documentos e endereços são fictícios.

## Scripts

| Comando                        | O que faz                                                            |
| ------------------------------ | -------------------------------------------------------------------- |
| `npm run dev`                  | Servidor de desenvolvimento (Turbopack)                              |
| `npm run build` / `npm start`  | Build e servidor de produção                                         |
| `npm run check`                | Lint, typecheck e testes unitários                                   |
| `npm test`                     | Testes unitários (Vitest)                                            |
| `npm run test:e2e`             | Testes de ponta a ponta (Playwright); criam registros no banco local |
| `npm run db:start` / `db:stop` | Sobe ou derruba o Supabase local                                     |
| `npm run db:reset`             | Recria o banco (migrations, seed e dados de simulação)               |
| `npm run db:test`              | Testes do banco em pgTAP: RLS, kardex, auditoria                     |
| `npm run db:pull`              | Regenera os tipos do Drizzle a partir do banco                       |
| `npm run format`               | Prettier                                                             |

Para gerar um build de produção sem apagar o `.next` do servidor de desenvolvimento, use
`NEXT_DIST_DIR=.next-build npx next build` e `NEXT_DIST_DIR=.next-build PORT=3100 npx next start`.

## Estrutura

```
src/
  app/
    page.tsx                landing page
    login/                  tela de entrada
    (sistema)/sistema/      área logada: painel, entradas, producao, estoque, vendas,
                            orcamentos, cadastros, relatorios, auditoria
  components/
    site/                   landing (seções, cena 3D, botões e ícones animados)
    sistema/, painel/       componentes da área logada e gráficos
    form/, tabela/, ui/     campos de formulário, tabela de dados e shadcn/ui
  config/site.ts            nome, textos, contatos, produtos, FAQ da landing
  db/                       conexão Drizzle, comUsuario() e tipos gerados (db/gerado)
  lib/
    calculos.ts             fórmulas da serraria (com testes)
    entradas.ts, producao.ts, vendas.ts   cálculos de cada módulo (com testes)
    format.ts, validacao.ts formatação brasileira e validações (CPF/CNPJ, placa, números)
    consultas/, relatorios.ts, pdf/, excel.ts
supabase/
  migrations/               SQL: fonte da verdade do banco
  seed.sql, seeds/          dados iniciais e de simulação
  tests/                    testes pgTAP
e2e/                        testes Playwright
scripts/                    gerador de dados e pós-processamento do db:pull
```

## Regras de cálculo

Ficam em `src/lib/calculos.ts`, com decimal.js para não acumular erro de ponto flutuante:

| Função                          | Fórmula                                                                          |
| ------------------------------- | -------------------------------------------------------------------------------- |
| `volumePecaM3(esp, larg, comp)` | (esp/100) × (larg/100) × comp. Exemplo: 1,8 × 9 × 1,20 = 0,001944 m³             |
| `volumePecasM3(..., qtd)`       | volume da peça × quantidade, sem arredondar a peça antes (100 peças = 0,1944 m³) |
| `volumeToraM3(diam, comp, qtd)` | π × (diam/200)² × comp × qtd                                                     |
| `volumeEstereo(c, l, a)`        | c × l × a                                                                        |
| `pesoLiquido(bruto, tara)`      | bruto − tara, nunca negativo                                                     |
| `valorTotal(qtd, unitario)`     | arredondado a centavos, meia para cima                                           |
| `rendimento(serrado, tora)`     | serrado ÷ tora × 100                                                             |

Volumes têm 6 casas e dinheiro 2. O que vale é sempre o cálculo do servidor; o navegador só
mostra a prévia.

**Números digitados.** Os campos aceitam vírgula (`1,8`). Um ponto seguido de exatamente três
dígitos é lido como milhar (`45.300` kg = 45 300), e os demais pontos como decimal (`1.8`). Uma
medida digitada por engano no formato de milhar, como `2.400` m, cai no limite máximo do campo e
é recusada.

**Estoque de toras.** Cada carga entra na unidade em que foi comprada. Para somar, cada espécie
tem fatores editáveis em **Cadastros → Espécies** (padrão: 0,65 m³ por estéreo; 1,15 m³ por
tonelada de Pinus e 0,95 de Eucalipto). São médias de referência e devem ser conferidas com a
serraria.

## Banco e segurança

- As migrations SQL em `supabase/migrations` são a fonte da verdade; o Drizzle só introspecta.
- Toda tabela tem `created_at`, `updated_at`, `created_by` e `updated_by` preenchidos por gatilho,
  então data e hora de registro nunca são digitadas.
- A auditoria grava o antes e o depois de cada INSERT, UPDATE e DELETE nas tabelas de negócio.
- O saldo do estoque só muda por movimentação (`estoque_mov`), na mesma transação e com trava de
  linha. Saldo negativo é recusado, salvo confirmação explícita. O kardex não pode ser alterado
  nem excluído.
- RLS ligado em todas as tabelas: só usuário logado e ativo lê ou grava; visitante do site só
  consegue enviar orçamento. Desativar um usuário corta o acesso na próxima requisição.
- No servidor, as ações rodam com `comUsuario()`, que abre a transação com o papel
  `authenticated` e o JWT do usuário. Assim o RLS vale também para as consultas do Drizzle.
- Todas as ações validam a entrada com Zod no servidor. O formulário do site tem armadilha para
  robôs e limite de 5 envios a cada 10 minutos por IP (em memória; com mais de uma instância,
  troque por Redis/Upstash).
- Cabeçalhos de segurança: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`,
  `Permissions-Policy` e HSTS.
- A chave secreta do Supabase só existe no servidor (`src/lib/supabase/admin.ts`, marcado como
  `server-only`) e é usada apenas para criar usuários e trocar senhas.

## Qualidade verificada

- Testes: 68 unitários, 19 de banco (pgTAP) e 5 de ponta a ponta.
- Acessibilidade: nenhuma violação WCAG A/AA (axe) em 11 telas do sistema; login com 100 no
  Lighthouse.
- Landing no Lighthouse (celular): desempenho 84, boas práticas 100, SEO 100. A cena 3D só é
  baixada depois que a página fica ociosa e apenas em aparelhos com GPU; nos demais aparece a
  imagem estática `public/hero-serraria.png`.
- Sem rolagem horizontal em largura de celular (390 px) nas telas principais.

## Personalização da landing

Nome, slogan, contatos, WhatsApp, números, produtos, bitolas, etapas, FAQ e depoimentos ficam em
`src/config/site.ts`. Os itens marcados como `EXEMPLO` e os depoimentos (identificados na própria
página como texto de exemplo) devem ser trocados pelos dados reais do cliente.

Se a cena 3D mudar, a imagem de capa precisa ser recapturada com o screenshot do elemento
`canvas` em fundo transparente, salvo em `public/hero-serraria.png`.

## NF-e (pendente)

A emissão fica para depois da aprovação do site pelo cliente. O banco já tem as tabelas
`notas_fiscais`, `nfe_eventos` e `nfe_logs`, o romaneio já mostra número, série, chave de acesso e
protocolo quando existe uma nota autorizada, e a empresa já guarda série, próximo número, CRT,
CFOP, CSOSN/CST e alíquotas em **Cadastros → Empresa e fiscal**.

Plano combinado:

1. Camada `src/lib/fiscal/` com a interface `NFeProvider` (`emitir`, `consultar`, `cancelar`,
   `cartaCorrecao`, `baixarXml`, `baixarDanfe`).
2. Provedor via API de emissão, começando pelo Focus NFe (token em `FOCUS_NFE_TOKEN`), com
   opção futura de Nuvem Fiscal, PlugNotas ou NFE.io. A emissão real é feita pelos web services
   SOAP da SEFAZ com XML 4.00 assinado por certificado A1; o portal nacional da NF-e não é uma
   API.
3. Um provedor simulador para testar o fluxo inteiro sem conta (XML e DANFE marcados "SEM VALOR
   FISCAL").
4. Homologação e produção definidos por `NFE_AMBIENTE`, com aviso grande na tela em homologação.
5. Preparação para provedor direto com a SEFAZ usando o certificado A1 (`.pfx`), sem implementar.
6. Cancelamento (justificativa de no mínimo 15 caracteres), carta de correção, log de chamadas sem
   dados sensíveis e webhook do provedor.

Para ativar será preciso: conta e token do provedor (homologação primeiro), CNPJ e IE reais da
empresa, certificado digital A1 e confirmação com o contador do regime tributário, NCM (sugestões
cadastradas: Pinus 4407.11.00, Eucalipto 4407.99.90, toras na posição 4403), CFOP (5101/6101) e
CST/CSOSN.

**Documento florestal.** Pinus e Eucalipto de floresta plantada normalmente não exigem DOF do
IBAMA, ao contrário da madeira nativa. A venda tem um campo opcional para documento florestal ou
observação ambiental; o cliente deve confirmar a exigência com o contador e com o órgão ambiental
do estado.

## Deploy (Vercel + Supabase)

Não foi feito: o projeto está em teste local. Quando for a hora:

1. Criar um projeto no Supabase (região São Paulo) e anotar URL, chave publishable, chave secret
   e as strings de conexão (pooler 6543 e sessão 5432).
2. Aplicar o banco: `supabase link --project-ref <ref>` e `supabase db push`. Não rode os seeds
   de simulação em produção.
3. Cadastrar espécies, qualidades, preços e empresa pela própria interface (ou por um seed de
   produção sem dados fictícios).
4. Criar o primeiro usuário no painel do Supabase (Authentication → Add user), com
   `{"nome": "Nome da pessoa"}` em `app_metadata`; o gatilho cria o perfil sozinho.
5. Em Authentication → URL Configuration, apontar Site URL e Redirect URLs para o domínio final.
6. Na Vercel, importar o repositório e configurar as variáveis do `.env.example`
   (`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
   `SUPABASE_SECRET_KEY`, `DATABASE_URL` com o pooler na porta 6543, `NEXT_PUBLIC_WHATSAPP`).
7. Publicar e conferir o login, um lançamento de cada módulo, o romaneio em PDF e o formulário de
   orçamento do site.
