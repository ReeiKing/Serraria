"use client"

import { format } from "date-fns"
import { useFormContext, useWatch } from "react-hook-form"

import { CampoNumero, CampoSelect, CampoTexto, CampoTextoLongo } from "@/components/form/campos"
import { FormularioCadastro } from "@/components/form/formulario-cadastro"
import { PaginaCadastro } from "@/components/sistema/pagina-cadastro"
import type { Coluna } from "@/components/tabela/tabela-dados"
import { Badge } from "@/components/ui/badge"
import type { tabelaPrecos } from "@/db/gerado/schema"
import { formatData, formatMoeda, numeroParaCampo } from "@/lib/format"
import { precoSchema } from "@/lib/schemas/cadastros"

import { excluirPreco, salvarPreco } from "../actions"

type Preco = typeof tabelaPrecos.$inferSelect
type Opcao = { id: string; nome: string }

const UNIDADES: Record<string, string> = { st: "R$/st", m3: "R$/m³", t: "R$/t" }
const TIPOS = [
  { valor: "venda_serrada", rotulo: "Venda de madeira serrada" },
  { valor: "compra_tora", rotulo: "Compra de tora" },
]

function CamposPreco({ especies, qualidades }: { especies: Opcao[]; qualidades: Opcao[] }) {
  const { setValue } = useFormContext()
  const tipo = useWatch({ name: "tipo" })
  const venda = tipo === "venda_serrada"

  return (
    <>
      <CampoSelect
        name="tipo"
        label="Tipo de preço"
        opcoes={TIPOS}
        aoMudar={(v) => {
          if (v === "venda_serrada") setValue("unidade", "m3")
          else setValue("qualidadeId", "")
        }}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <CampoSelect
          name="especieId"
          label="Espécie"
          opcoes={especies.map((e) => ({ valor: e.id, rotulo: e.nome }))}
        />
        {venda ? (
          <CampoSelect
            name="qualidadeId"
            label="Qualidade"
            opcoes={qualidades.map((q) => ({ valor: q.id, rotulo: q.nome }))}
          />
        ) : (
          <CampoSelect
            name="unidade"
            label="Unidade de compra"
            opcoes={[
              { valor: "m3", rotulo: "Metro cúbico (m³)" },
              { valor: "st", rotulo: "Metro estéreo (st)" },
              { valor: "t", rotulo: "Tonelada (t)" },
            ]}
          />
        )}
        <CampoNumero
          name="valor"
          label={venda ? "Preço por m³" : "Preço por unidade"}
          placeholder="0,00"
          sufixo="R$"
        />
        <CampoTexto name="vigenciaInicio" label="Vale a partir de" type="date" />
      </div>
      <CampoTextoLongo name="observacao" label="Observação" rows={2} />
    </>
  )
}

export function ListaPrecos({
  dados,
  especies,
  qualidades,
  idsVigentes,
}: {
  dados: Preco[]
  especies: Opcao[]
  qualidades: Opcao[]
  idsVigentes: string[]
}) {
  const nome = (lista: Opcao[], id: string | null) => lista.find((x) => x.id === id)?.nome ?? ""
  const vigente = (p: Preco) => idsVigentes.includes(p.id)

  const colunas: Coluna<Preco>[] = [
    {
      id: "item",
      header: "Item",
      accessorFn: (p) => `${nome(especies, p.especieId)} ${nome(qualidades, p.qualidadeId)}`,
      cell: ({ row: { original: p } }) => (
        <div>
          <div className="font-medium">
            {nome(especies, p.especieId)}
            {p.qualidadeId && ` · ${nome(qualidades, p.qualidadeId)}`}
          </div>
          <div className="text-muted-foreground text-xs">
            {p.tipo === "venda_serrada" ? "Venda de serrada" : "Compra de tora"}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "valor",
      header: "Preço",
      sortFn: "basic",
      cell: ({ row: { original: p } }) => (
        <span className="tabular-nums">
          {formatMoeda(p.valor)}{" "}
          <span className="text-muted-foreground text-xs">
            {UNIDADES[p.unidade]?.replace("R$", "")}
          </span>
        </span>
      ),
    },
    {
      accessorKey: "vigenciaInicio",
      header: "Vigência",
      cell: ({ row }) => formatData(`${row.original.vigenciaInicio}T12:00:00`),
    },
    {
      id: "situacao",
      header: "Situação",
      cell: ({ row }) =>
        vigente(row.original) ? (
          <Badge className="bg-floresta text-floresta-foreground">Vigente</Badge>
        ) : (
          <Badge variant="outline" className="text-muted-foreground">
            {row.original.vigenciaInicio > format(new Date(), "yyyy-MM-dd")
              ? "Futuro"
              : "Histórico"}
          </Badge>
        ),
    },
  ]

  return (
    <PaginaCadastro
      dados={dados}
      colunas={colunas}
      textoBusca={(p) =>
        `${nome(especies, p.especieId)} ${nome(qualidades, p.qualidadeId)} ${p.tipo === "venda_serrada" ? "venda" : "compra tora"}`
      }
      buscaPlaceholder="Buscar por espécie, qualidade, compra ou venda"
      rotuloNovo="Novo preço"
      tituloPainel={(r) => (r ? "Editar preço" : "Novo preço")}
      formulario={(r, fechar) => (
        <FormularioCadastro
          schema={precoSchema}
          valoresIniciais={{
            tipo: r?.tipo ?? "venda_serrada",
            especieId: r?.especieId ?? especies[0]?.id ?? "",
            qualidadeId: r?.qualidadeId ?? "",
            unidade: r?.unidade ?? "m3",
            valor: numeroParaCampo(r?.valor),
            vigenciaInicio: r?.vigenciaInicio ?? format(new Date(), "yyyy-MM-dd"),
            observacao: r?.observacao ?? "",
          }}
          salvar={(v) => salvarPreco(r?.id ?? null, v)}
          excluir={r ? () => excluirPreco(r.id) : undefined}
          aoConcluir={fechar}
        >
          <CamposPreco especies={especies} qualidades={qualidades} />
        </FormularioCadastro>
      )}
    />
  )
}
