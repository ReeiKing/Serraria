"use client"

import { CampoNumero, CampoSelect, CampoTexto, CampoTextoLongo } from "@/components/form/campos"
import { FormularioCadastro } from "@/components/form/formulario-cadastro"
import { BadgeAtivo } from "@/components/sistema/badge-ativo"
import { PaginaCadastro } from "@/components/sistema/pagina-cadastro"
import type { Coluna } from "@/components/tabela/tabela-dados"
import type { produtos } from "@/db/gerado/schema"
import { formatMoeda, numeroParaCampo } from "@/lib/format"
import { produtoSchema } from "@/lib/schemas/cadastros"
import { CATEGORIAS_PRODUTO } from "@/lib/vendas"

import { ativarProduto, excluirProduto, salvarProduto } from "../actions"

type Produto = typeof produtos.$inferSelect
type Opcao = { id: string; nome: string }

const nomeCategoria = (c: string) => CATEGORIAS_PRODUTO.find((x) => x.valor === c)?.rotulo ?? c

export function ListaProdutos({ dados, especies }: { dados: Produto[]; especies: Opcao[] }) {
  const colunas: Coluna<Produto>[] = [
    {
      accessorKey: "nome",
      header: "Produto",
      cell: ({ row: { original: p } }) => (
        <div>
          <div className="font-medium">{p.nome}</div>
          {p.dimensoes && <div className="text-muted-foreground text-xs">{p.dimensoes}</div>}
        </div>
      ),
    },
    {
      accessorKey: "categoria",
      header: "Categoria",
      cell: ({ row }) => nomeCategoria(row.original.categoria),
    },
    {
      accessorKey: "precoVenda",
      header: "Preço",
      sortFn: "basic",
      meta: { className: "text-right tabular-nums" },
      cell: ({ row }) => `${formatMoeda(row.original.precoVenda)}/un.`,
    },
    {
      accessorKey: "saldoUnidades",
      header: "Em estoque",
      meta: { className: "text-right tabular-nums hidden sm:table-cell" },
      cell: ({ row }) => `${row.original.saldoUnidades.toLocaleString("pt-BR")} un.`,
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
      textoBusca={(p) => `${p.nome} ${nomeCategoria(p.categoria)} ${p.dimensoes ?? ""}`}
      buscaPlaceholder="Buscar por nome, categoria ou medida"
      rotuloNovo="Novo produto"
      tituloPainel={(r) => (r ? r.nome : "Novo produto")}
      formulario={(r, fechar) => (
        <FormularioCadastro
          schema={produtoSchema}
          valoresIniciais={{
            nome: r?.nome ?? "",
            categoria: r?.categoria ?? "palete",
            descricao: r?.descricao ?? "",
            dimensoes: r?.dimensoes ?? "",
            especieId: r?.especieId ?? "",
            ncm: r?.ncm ?? "",
            precoVenda: numeroParaCampo(r?.precoVenda),
            estoqueMinimo: String(r?.estoqueMinimo ?? 0),
          }}
          salvar={(v) => salvarProduto(r?.id ?? null, v)}
          excluir={r ? () => excluirProduto(r.id) : undefined}
          ativo={r ? { valor: r.ativo, alternar: () => ativarProduto(r.id, !r.ativo) } : undefined}
          aoConcluir={fechar}
        >
          <CampoTexto name="nome" label="Nome" autoFocus placeholder="Ex.: Palete PBR" />
          <div className="grid gap-4 sm:grid-cols-2">
            <CampoSelect name="categoria" label="Categoria" opcoes={[...CATEGORIAS_PRODUTO]} />
            <CampoTexto name="dimensoes" label="Dimensões" placeholder="Ex.: 1,00 × 1,20 m" />
            <CampoNumero
              name="precoVenda"
              label="Preço de venda"
              sufixo="R$/un."
              placeholder="0,00"
            />
            <CampoNumero
              name="estoqueMinimo"
              label="Estoque mínimo"
              sufixo="un."
              descricao="Abaixo disso aparece o alerta."
            />
            <CampoSelect
              name="especieId"
              label="Madeira usada"
              opcoes={especies.map((e) => ({ valor: e.id, rotulo: e.nome }))}
              permitirVazio
            />
            <CampoTexto
              name="ncm"
              label="NCM"
              inputMode="numeric"
              descricao="Palete 4415.20.00 · caixote 4415.10.00 (confirmar com o contador)"
            />
          </div>
          <CampoTextoLongo name="descricao" label="Descrição" rows={2} />
        </FormularioCadastro>
      )}
    />
  )
}
