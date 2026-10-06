"use client"

import { CampoTexto } from "@/components/form/campos"
import { FormularioCadastro } from "@/components/form/formulario-cadastro"
import { BadgeAtivo } from "@/components/sistema/badge-ativo"
import { PaginaCadastro } from "@/components/sistema/pagina-cadastro"
import type { Coluna } from "@/components/tabela/tabela-dados"
import type { motoristas } from "@/db/gerado/schema"
import { formatDocumento, formatTelefone } from "@/lib/format"
import { motoristaSchema } from "@/lib/schemas/cadastros"

import { ativarMotorista, excluirMotorista, salvarMotorista } from "../actions"

type Motorista = typeof motoristas.$inferSelect

const colunas: Coluna<Motorista>[] = [
  {
    accessorKey: "nome",
    header: "Nome",
    cell: ({ row }) => <span className="font-medium">{row.original.nome}</span>,
  },
  { accessorKey: "cpf", header: "CPF", cell: ({ row }) => formatDocumento(row.original.cpf) },
  {
    accessorKey: "telefone",
    header: "Telefone",
    cell: ({ row }) => formatTelefone(row.original.telefone),
    meta: { className: "hidden md:table-cell" },
  },
  {
    accessorKey: "transportadora",
    header: "Transportadora",
    meta: { className: "hidden md:table-cell" },
  },
  {
    accessorKey: "ativo",
    header: "Situação",
    cell: ({ row }) => <BadgeAtivo ativo={row.original.ativo} />,
  },
]

export function ListaMotoristas({ dados }: { dados: Motorista[] }) {
  return (
    <PaginaCadastro
      dados={dados}
      colunas={colunas}
      buscaPlaceholder="Buscar por nome, CPF ou transportadora"
      rotuloNovo="Novo motorista"
      tituloPainel={(r) => (r ? r.nome : "Novo motorista")}
      formulario={(r, fechar) => (
        <FormularioCadastro
          schema={motoristaSchema}
          valoresIniciais={{
            nome: r?.nome ?? "",
            cpf: r?.cpf ?? "",
            cnh: r?.cnh ?? "",
            telefone: r?.telefone ?? "",
            transportadora: r?.transportadora ?? "",
          }}
          salvar={(v) => salvarMotorista(r?.id ?? null, v)}
          excluir={r ? () => excluirMotorista(r.id) : undefined}
          ativo={
            r ? { valor: r.ativo, alternar: () => ativarMotorista(r.id, !r.ativo) } : undefined
          }
          aoConcluir={fechar}
        >
          <CampoTexto name="nome" label="Nome" autoFocus />
          <div className="grid gap-4 sm:grid-cols-2">
            <CampoTexto name="cpf" label="CPF" inputMode="numeric" />
            <CampoTexto name="cnh" label="CNH" inputMode="numeric" />
            <CampoTexto name="telefone" label="Telefone" inputMode="tel" />
            <CampoTexto name="transportadora" label="Transportadora (opcional)" />
          </div>
        </FormularioCadastro>
      )}
    />
  )
}
