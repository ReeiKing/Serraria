"use client"

import { CampoTexto } from "@/components/form/campos"
import { FormularioCadastro } from "@/components/form/formulario-cadastro"
import { BadgeAtivo } from "@/components/sistema/badge-ativo"
import { PaginaCadastro } from "@/components/sistema/pagina-cadastro"
import type { Coluna } from "@/components/tabela/tabela-dados"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatData } from "@/lib/format"
import { novoUsuarioSchema, senhaSchema } from "@/lib/schemas/cadastros"

import { ativarUsuario, criarUsuario, renomearUsuario, trocarSenhaUsuario } from "../actions"

type Usuario = { id: string; nome: string; email: string; ativo: boolean; createdAt: string }

export function ListaUsuarios({ dados, meuId }: { dados: Usuario[]; meuId: string }) {
  const colunas: Coluna<Usuario>[] = [
    {
      accessorKey: "nome",
      header: "Nome",
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.nome}
          {row.original.id === meuId && (
            <Badge variant="outline" className="ml-2 text-[10px]">
              você
            </Badge>
          )}
        </span>
      ),
    },
    { accessorKey: "email", header: "E-mail" },
    {
      accessorKey: "createdAt",
      header: "Desde",
      cell: ({ row }) => formatData(row.original.createdAt),
      meta: { className: "hidden sm:table-cell" },
    },
    {
      accessorKey: "ativo",
      header: "Situação",
      cell: ({ row }) => <BadgeAtivo ativo={row.original.ativo} />,
    },
  ]

  return (
    <PaginaCadastro
      dados={dados}
      colunas={colunas}
      buscaPlaceholder="Buscar por nome ou e-mail"
      rotuloNovo="Novo usuário"
      tituloPainel={(r) => (r ? r.nome : "Novo usuário")}
      formulario={(r, fechar) =>
        r ? (
          <div className="flex flex-col gap-8">
            <FormularioCadastro
              schema={novoUsuarioSchema.pick({ nome: true })}
              valoresIniciais={{ nome: r.nome }}
              salvar={(v) => renomearUsuario(r.id, v)}
              ativo={
                r.id === meuId
                  ? undefined
                  : { valor: r.ativo, alternar: () => ativarUsuario(r.id, !r.ativo) }
              }
              aoConcluir={fechar}
            >
              <CampoTexto name="nome" label="Nome" />
              <p className="text-muted-foreground text-sm">E-mail de acesso: {r.email}</p>
            </FormularioCadastro>
            <Separator />
            <FormularioCadastro
              schema={senhaSchema}
              valoresIniciais={{ senha: "" }}
              salvar={(v) => trocarSenhaUsuario(r.id, v)}
              rotuloSalvar="Trocar senha"
              mensagemSucesso="Senha alterada."
              aoConcluir={fechar}
            >
              <CampoTexto
                name="senha"
                label="Nova senha"
                type="password"
                autoComplete="new-password"
              />
            </FormularioCadastro>
          </div>
        ) : (
          <FormularioCadastro
            schema={novoUsuarioSchema}
            valoresIniciais={{ nome: "", email: "", senha: "" }}
            salvar={criarUsuario}
            mensagemSucesso="Usuário criado. Ele já pode entrar com o e-mail e a senha informados."
            aoConcluir={fechar}
          >
            <CampoTexto name="nome" label="Nome" autoFocus />
            <CampoTexto name="email" label="E-mail" type="email" autoComplete="off" />
            <CampoTexto
              name="senha"
              label="Senha inicial"
              type="password"
              autoComplete="new-password"
              descricao="Mínimo de 8 caracteres."
            />
          </FormularioCadastro>
        )
      }
    />
  )
}
