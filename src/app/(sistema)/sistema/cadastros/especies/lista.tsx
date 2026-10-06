"use client"

import { CampoNumero, CampoSwitch, CampoTexto } from "@/components/form/campos"
import { FormularioCadastro } from "@/components/form/formulario-cadastro"
import { BadgeAtivo } from "@/components/sistema/badge-ativo"
import { PaginaCadastro } from "@/components/sistema/pagina-cadastro"
import type { Coluna } from "@/components/tabela/tabela-dados"
import type { especies, qualidades } from "@/db/gerado/schema"
import { numeroParaCampo } from "@/lib/format"
import { especieSchema, qualidadeSchema } from "@/lib/schemas/cadastros"

import {
  ativarEspecie,
  ativarQualidade,
  excluirEspecie,
  excluirQualidade,
  salvarEspecie,
  salvarQualidade,
} from "../actions"

type Especie = typeof especies.$inferSelect
type Qualidade = typeof qualidades.$inferSelect

const ncm = (v: string | null) => (v ? v.replace(/^(\d{4})(\d{2})(\d{2})$/, "$1.$2.$3") : "—")

const colunasEspecie: Coluna<Especie>[] = [
  {
    accessorKey: "nome",
    header: "Espécie",
    cell: ({ row }) => <span className="font-medium">{row.original.nome}</span>,
  },
  {
    accessorKey: "nomeCientifico",
    header: "Nome científico",
    cell: ({ row }) => <i>{row.original.nomeCientifico}</i>,
    meta: { className: "hidden md:table-cell" },
  },
  {
    accessorKey: "ncmSerrada",
    header: "NCM serrada",
    cell: ({ row }) => ncm(row.original.ncmSerrada),
  },
  {
    accessorKey: "ncmTora",
    header: "NCM tora",
    cell: ({ row }) => ncm(row.original.ncmTora),
    meta: { className: "hidden sm:table-cell" },
  },
  {
    accessorKey: "ativo",
    header: "Situação",
    cell: ({ row }) => <BadgeAtivo ativo={row.original.ativo} />,
  },
]

export function ListaEspecies({ dados }: { dados: Especie[] }) {
  return (
    <PaginaCadastro
      dados={dados}
      colunas={colunasEspecie}
      rotuloNovo="Nova espécie"
      tituloPainel={(r) => (r ? r.nome : "Nova espécie")}
      formulario={(r, fechar) => (
        <FormularioCadastro
          schema={especieSchema}
          valoresIniciais={{
            nome: r?.nome ?? "",
            nomeCientifico: r?.nomeCientifico ?? "",
            conifera: r?.conifera ?? false,
            ncmSerrada: r?.ncmSerrada ?? "",
            ncmTora: r?.ncmTora ?? "",
            fatorStM3: numeroParaCampo(r?.fatorStM3 ?? 0.65),
            fatorTM3: numeroParaCampo(r?.fatorTM3 ?? 1),
          }}
          salvar={(v) => salvarEspecie(r?.id ?? null, v)}
          excluir={r ? () => excluirEspecie(r.id) : undefined}
          ativo={r ? { valor: r.ativo, alternar: () => ativarEspecie(r.id, !r.ativo) } : undefined}
          aoConcluir={fechar}
        >
          <CampoTexto name="nome" label="Nome" autoFocus />
          <CampoTexto name="nomeCientifico" label="Nome científico" />
          <CampoSwitch name="conifera" label="Conífera (ex.: Pinus)" />
          <div className="grid gap-4 sm:grid-cols-2">
            <CampoTexto
              name="ncmSerrada"
              label="NCM da madeira serrada"
              inputMode="numeric"
              descricao="Coníferas: 4407.1x · demais: 4407.9x"
            />
            <CampoTexto
              name="ncmTora"
              label="NCM da tora"
              inputMode="numeric"
              descricao="Posição 4403"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <CampoNumero
              name="fatorStM3"
              label="m³ por metro estéreo"
              descricao="Converte toras compradas em estéreo para m³ (padrão 0,65)."
            />
            <CampoNumero
              name="fatorTM3"
              label="m³ por tonelada"
              descricao="Converte toras compradas por peso para m³."
            />
          </div>
        </FormularioCadastro>
      )}
    />
  )
}

const colunasQualidade: Coluna<Qualidade>[] = [
  { accessorKey: "ordem", header: "Ordem", meta: { className: "w-20" } },
  {
    accessorKey: "nome",
    header: "Qualidade",
    cell: ({ row }) => <span className="font-medium">{row.original.nome}</span>,
  },
  {
    accessorKey: "ativo",
    header: "Situação",
    cell: ({ row }) => <BadgeAtivo ativo={row.original.ativo} />,
  },
]

export function ListaQualidades({ dados }: { dados: Qualidade[] }) {
  return (
    <PaginaCadastro
      dados={dados}
      colunas={colunasQualidade}
      rotuloNovo="Nova qualidade"
      tituloPainel={(r) => (r ? r.nome : "Nova qualidade")}
      formulario={(r, fechar) => (
        <FormularioCadastro
          schema={qualidadeSchema}
          valoresIniciais={{
            nome: r?.nome ?? "",
            ordem: r ? String(r.ordem) : String(dados.length + 1),
          }}
          salvar={(v) => salvarQualidade(r?.id ?? null, v)}
          excluir={r ? () => excluirQualidade(r.id) : undefined}
          ativo={
            r ? { valor: r.ativo, alternar: () => ativarQualidade(r.id, !r.ativo) } : undefined
          }
          aoConcluir={fechar}
        >
          <CampoTexto name="nome" label="Nome" autoFocus placeholder="Ex.: 1ª linha" />
          <CampoNumero name="ordem" label="Ordem de exibição" />
        </FormularioCadastro>
      )}
    />
  )
}
