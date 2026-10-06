"use client"

import { CampoTexto, CampoTextoLongo } from "@/components/form/campos"
import { CamposEndereco } from "@/components/form/campos-endereco"
import { FormularioCadastro } from "@/components/form/formulario-cadastro"
import { BadgeAtivo } from "@/components/sistema/badge-ativo"
import { PaginaCadastro } from "@/components/sistema/pagina-cadastro"
import type { Coluna } from "@/components/tabela/tabela-dados"
import type { fornecedores } from "@/db/gerado/schema"
import { formatDocumento, formatTelefone } from "@/lib/format"
import { fornecedorSchema } from "@/lib/schemas/cadastros"

import { ativarFornecedor, excluirFornecedor, salvarFornecedor } from "../actions"

type Fornecedor = typeof fornecedores.$inferSelect

const colunas: Coluna<Fornecedor>[] = [
  {
    accessorKey: "nome",
    header: "Nome",
    cell: ({ row }) => <span className="font-medium">{row.original.nome}</span>,
  },
  {
    accessorKey: "documento",
    header: "CPF/CNPJ",
    cell: ({ row }) => formatDocumento(row.original.documento),
  },
  {
    id: "cidade",
    header: "Município",
    accessorFn: (r) => [r.municipio, r.uf].filter(Boolean).join("/"),
    meta: { className: "hidden md:table-cell" },
  },
  {
    accessorKey: "telefone",
    header: "Telefone",
    cell: ({ row }) => formatTelefone(row.original.telefone),
    meta: { className: "hidden md:table-cell" },
  },
  {
    accessorKey: "ativo",
    header: "Situação",
    cell: ({ row }) => <BadgeAtivo ativo={row.original.ativo} />,
  },
]

export function ListaFornecedores({ dados }: { dados: Fornecedor[] }) {
  return (
    <PaginaCadastro
      dados={dados}
      colunas={colunas}
      buscaPlaceholder="Buscar por nome, CPF/CNPJ ou município"
      rotuloNovo="Novo fornecedor"
      tituloPainel={(r) => (r ? r.nome : "Novo fornecedor")}
      formulario={(r, fechar) => (
        <FormularioCadastro
          schema={fornecedorSchema}
          valoresIniciais={{
            nome: r?.nome ?? "",
            documento: r?.documento ?? "",
            ie: r?.ie ?? "",
            telefone: r?.telefone ?? "",
            email: r?.email ?? "",
            cep: r?.cep ?? "",
            logradouro: r?.logradouro ?? "",
            numero: r?.numero ?? "",
            bairro: r?.bairro ?? "",
            municipio: r?.municipio ?? "",
            uf: r?.uf ?? "",
            observacoes: r?.observacoes ?? "",
          }}
          salvar={(v) => salvarFornecedor(r?.id ?? null, v)}
          excluir={r ? () => excluirFornecedor(r.id) : undefined}
          ativo={
            r ? { valor: r.ativo, alternar: () => ativarFornecedor(r.id, !r.ativo) } : undefined
          }
          aoConcluir={fechar}
        >
          <CampoTexto name="nome" label="Nome / razão social" autoFocus />
          <div className="grid gap-4 sm:grid-cols-2">
            <CampoTexto name="documento" label="CPF ou CNPJ" inputMode="numeric" />
            <CampoTexto name="ie" label="Inscrição estadual" />
            <CampoTexto name="telefone" label="Telefone" inputMode="tel" />
            <CampoTexto name="email" label="E-mail" type="email" />
          </div>
          <CamposEndereco comComplemento={false} />
          <CampoTextoLongo name="observacoes" label="Observações" />
        </FormularioCadastro>
      )}
    />
  )
}
