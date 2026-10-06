"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Plus, Save, SlidersHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { FormProvider, useForm, useWatch, type Resolver } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"

import { CampoNumero, CampoSelect, CampoTexto } from "@/components/form/campos"
import { EscolhaCartoes } from "@/components/sistema/escolha-cartoes"
import { TabelaDados, type Coluna } from "@/components/tabela/tabela-dados"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FieldGroup } from "@/components/ui/field"
import { formatMoeda } from "@/lib/format"
import { MOTIVOS_AJUSTE, ajusteProdutoSchema } from "@/lib/schemas/producao"
import { cn } from "@/lib/utils"
import { CATEGORIAS_PRODUTO } from "@/lib/vendas"

import { ajustarProduto } from "./actions"
import { BadgeSituacao } from "./lista"

export type ProdutoEstoque = {
  id: string
  nome: string
  categoria: string
  dimensoes: string | null
  saldoUnidades: number
  precoVenda: string
  estoqueMinimo: number
  situacao: "ok" | "baixo" | "zerado" | "negativo"
}

type Valores = z.input<typeof ajusteProdutoSchema>

export function DialogoAjusteProduto({
  aberto,
  aoFechar,
  produtos,
  produtoId,
}: {
  aberto: boolean
  aoFechar: () => void
  produtos: { id: string; nome: string }[]
  produtoId?: string
}) {
  const router = useRouter()
  const [pendente, iniciar] = useTransition()
  const form = useForm<Valores>({
    resolver: zodResolver(ajusteProdutoSchema) as unknown as Resolver<Valores>,
    values: {
      produtoId: produtoId ?? produtos[0]?.id ?? "",
      sentido: "saida",
      quantidade: "",
      motivo: "inventario",
      observacao: "",
      permitirNegativo: false,
    },
  })
  const sentido = useWatch({ control: form.control, name: "sentido" })

  function enviar(permitirNegativo: boolean) {
    iniciar(async () => {
      const r = await ajustarProduto({ ...form.getValues(), permitirNegativo })
      if (r.ok) {
        toast.success("Ajuste lançado.")
        aoFechar()
        router.refresh()
      } else if (r.codigo === "ESTOQUE_NEGATIVO") {
        if (window.confirm(`${r.erro}.\n\nConfirmar o ajuste mesmo assim?`)) enviar(true)
      } else toast.error(r.erro)
    })
  }

  return (
    <Dialog open={aberto} onOpenChange={(a) => !a && aoFechar()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ajuste de estoque de produto</DialogTitle>
          <DialogDescription>
            Entrada ou saída manual, com motivo. Fica no histórico com data, hora e usuário.
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(() => enviar(false))} noValidate>
            <FieldGroup>
              <EscolhaCartoes
                nome="sentido-produto"
                valor={sentido}
                opcoes={[
                  { valor: "entrada", rotulo: "Entrada (+)" },
                  { valor: "saida", rotulo: "Saída (−)" },
                ]}
                aoMudar={(s) => form.setValue("sentido", s)}
              />
              {!produtoId && (
                <CampoSelect
                  name="produtoId"
                  label="Produto"
                  opcoes={produtos.map((p) => ({ valor: p.id, rotulo: p.nome }))}
                />
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <CampoNumero name="quantidade" label="Quantidade" sufixo="un." autoFocus />
                <CampoSelect name="motivo" label="Motivo" opcoes={[...MOTIVOS_AJUSTE]} />
              </div>
              <CampoTexto name="observacao" label="Observação" />
              <Button type="submit" size="lg" disabled={pendente} className="h-12">
                {pendente ? <Loader2 className="animate-spin" /> : <Save />} Lançar ajuste
              </Button>
            </FieldGroup>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}

const nomeCategoria = (c: string) => CATEGORIAS_PRODUTO.find((x) => x.valor === c)?.rotulo ?? c

const colunas: Coluna<ProdutoEstoque>[] = [
  {
    accessorKey: "nome",
    header: "Produto",
    cell: ({ row: { original: p } }) => (
      <div>
        <div className="font-medium">{p.nome}</div>
        <div className="text-muted-foreground text-xs">
          {[nomeCategoria(p.categoria), p.dimensoes].filter(Boolean).join(" · ")}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "saldoUnidades",
    header: "Em estoque",
    meta: { className: "text-right tabular-nums" },
    cell: ({ row: { original: p } }) => (
      <span className={cn("font-semibold", p.saldoUnidades < 0 && "text-destructive")}>
        {p.saldoUnidades.toLocaleString("pt-BR")} un.
      </span>
    ),
  },
  {
    accessorKey: "precoVenda",
    header: "Preço",
    sortFn: "basic",
    meta: { className: "text-right tabular-nums hidden sm:table-cell" },
    cell: ({ row }) => `${formatMoeda(row.original.precoVenda)}/un.`,
  },
  {
    id: "valor",
    header: "Valor estimado",
    accessorFn: (p) => Math.max(p.saldoUnidades, 0) * Number(p.precoVenda),
    meta: { className: "text-right tabular-nums hidden md:table-cell" },
    cell: ({ row: { original: p } }) =>
      formatMoeda(Math.max(p.saldoUnidades, 0) * Number(p.precoVenda)),
  },
  {
    accessorKey: "situacao",
    header: "Situação",
    cell: ({ row }) => <BadgeSituacao situacao={row.original.situacao} />,
  },
]

export function ListaEstoqueProdutos({ dados }: { dados: ProdutoEstoque[] }) {
  const router = useRouter()
  const [ajuste, setAjuste] = useState(false)
  return (
    <>
      <TabelaDados
        dados={dados}
        colunas={colunas}
        buscaPlaceholder="Buscar palete, caixote…"
        textoBusca={(p) => `${p.nome} ${nomeCategoria(p.categoria)} ${p.dimensoes ?? ""}`}
        aoClicarLinha={(p) => router.push(`/sistema/estoque/produto/${p.id}`)}
        vazio="Nenhum produto cadastrado. Cadastre em Cadastros → Paletes e caixotes."
        acoes={
          <>
            <Button variant="outline" size="lg" onClick={() => setAjuste(true)}>
              <SlidersHorizontal /> Ajuste
            </Button>
            <Button size="lg" onClick={() => router.push("/sistema/producao/produtos/nova")}>
              <Plus /> Montagem
            </Button>
          </>
        }
      />
      <DialogoAjusteProduto
        aberto={ajuste}
        aoFechar={() => setAjuste(false)}
        produtos={dados.map((p) => ({ id: p.id, nome: p.nome }))}
      />
    </>
  )
}
