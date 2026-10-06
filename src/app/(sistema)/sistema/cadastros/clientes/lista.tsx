"use client"

import { Loader2, Search } from "lucide-react"
import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { toast } from "sonner"

import { CampoSelect, CampoTexto, CampoTextoLongo } from "@/components/form/campos"
import { CamposEndereco } from "@/components/form/campos-endereco"
import { FormularioCadastro } from "@/components/form/formulario-cadastro"
import { BadgeAtivo } from "@/components/sistema/badge-ativo"
import { PaginaCadastro } from "@/components/sistema/pagina-cadastro"
import type { Coluna } from "@/components/tabela/tabela-dados"
import { Button } from "@/components/ui/button"
import type { clientes } from "@/db/gerado/schema"
import { buscarCnpj, buscarCodigoIbge } from "@/lib/brasilapi"
import { formatDocumento, formatTelefone } from "@/lib/format"
import { INDICADORES_IE, clienteSchema } from "@/lib/schemas/cadastros"
import { soDigitos } from "@/lib/validacao"

import { ativarCliente, excluirCliente, salvarCliente } from "../actions"

type Cliente = typeof clientes.$inferSelect

const colunas: Coluna<Cliente>[] = [
  {
    accessorKey: "razaoSocial",
    header: "Cliente",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.razaoSocial}</div>
        {row.original.nomeFantasia && (
          <div className="text-muted-foreground text-xs">{row.original.nomeFantasia}</div>
        )}
      </div>
    ),
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
    meta: { className: "hidden lg:table-cell" },
  },
  {
    accessorKey: "ativo",
    header: "Situação",
    cell: ({ row }) => <BadgeAtivo ativo={row.original.ativo} />,
  },
]

function BotaoBuscarCnpj() {
  const { getValues, setValue } = useFormContext()
  const [buscando, setBuscando] = useState(false)

  async function buscar() {
    const doc = soDigitos(getValues("documento"))
    if (doc.length !== 14) {
      toast.error("A busca automática funciona com CNPJ (14 dígitos).")
      return
    }
    setBuscando(true)
    try {
      const d = await buscarCnpj(doc)
      const codigoIbge = d.codigoIbge || (await buscarCodigoIbge(d.municipio, d.uf))
      const campos: Record<string, string> = {
        razaoSocial: d.razaoSocial,
        nomeFantasia: d.nomeFantasia,
        cep: d.cep,
        logradouro: d.logradouro,
        numero: d.numero,
        complemento: d.complemento,
        bairro: d.bairro,
        municipio: d.municipio,
        uf: d.uf,
        codigoIbge,
      }
      for (const [k, v] of Object.entries(campos))
        setValue(k, v, { shouldDirty: true, shouldValidate: v !== "" })
      if (d.telefone && !getValues("telefone"))
        setValue("telefone", d.telefone, { shouldDirty: true })
      if (d.email && !getValues("email")) setValue("email", d.email, { shouldDirty: true })
      toast.success("Dados preenchidos pela Receita (BrasilAPI). Confira a inscrição estadual.")
    } catch (err) {
      toast.error(
        err instanceof Error && err.message === "Não encontrado."
          ? "CNPJ não encontrado."
          : "Não foi possível consultar o CNPJ."
      )
    } finally {
      setBuscando(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={buscar}
      disabled={buscando}
      aria-label="Buscar dados do CNPJ"
    >
      {buscando ? <Loader2 className="animate-spin" /> : <Search />}
    </Button>
  )
}

export function ListaClientes({ dados }: { dados: Cliente[] }) {
  return (
    <PaginaCadastro
      dados={dados}
      colunas={colunas}
      buscaPlaceholder="Buscar por nome, CNPJ ou município"
      rotuloNovo="Novo cliente"
      tituloPainel={(r) => (r ? r.razaoSocial : "Novo cliente")}
      formulario={(r, fechar) => (
        <FormularioCadastro
          schema={clienteSchema}
          valoresIniciais={{
            razaoSocial: r?.razaoSocial ?? "",
            nomeFantasia: r?.nomeFantasia ?? "",
            documento: r?.documento ?? "",
            ie: r?.ie ?? "",
            indicadorIe: String(r?.indicadorIe ?? 9) as "1" | "2" | "9",
            email: r?.email ?? "",
            telefone: r?.telefone ?? "",
            cep: r?.cep ?? "",
            logradouro: r?.logradouro ?? "",
            numero: r?.numero ?? "",
            complemento: r?.complemento ?? "",
            bairro: r?.bairro ?? "",
            municipio: r?.municipio ?? "",
            codigoIbge: r?.codigoIbge ?? "",
            uf: r?.uf ?? "",
            observacoes: r?.observacoes ?? "",
          }}
          salvar={(v) => salvarCliente(r?.id ?? null, v)}
          excluir={r ? () => excluirCliente(r.id) : undefined}
          ativo={r ? { valor: r.ativo, alternar: () => ativarCliente(r.id, !r.ativo) } : undefined}
          aoConcluir={fechar}
        >
          <CampoTexto
            name="documento"
            label="CNPJ ou CPF"
            inputMode="numeric"
            autoFocus
            descricao="Com CNPJ, clique na lupa para buscar razão social e endereço."
            acao={<BotaoBuscarCnpj />}
          />
          <CampoTexto name="razaoSocial" label="Razão social / nome" />
          <CampoTexto name="nomeFantasia" label="Nome fantasia" />
          <div className="grid gap-4 sm:grid-cols-2">
            <CampoTexto name="ie" label="Inscrição estadual" />
            <CampoSelect name="indicadorIe" label="Situação no ICMS" opcoes={[...INDICADORES_IE]} />
            <CampoTexto name="telefone" label="Telefone" inputMode="tel" />
            <CampoTexto name="email" label="E-mail (recebe a NF-e)" type="email" />
          </div>
          <CamposEndereco comIbge />
          <CampoTextoLongo name="observacoes" label="Observações" />
        </FormularioCadastro>
      )}
    />
  )
}
