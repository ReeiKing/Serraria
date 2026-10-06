"use client"

import { CampoNumero, CampoSelect, CampoTexto } from "@/components/form/campos"
import { FormularioCadastro } from "@/components/form/formulario-cadastro"
import { BadgeAtivo } from "@/components/sistema/badge-ativo"
import { PaginaCadastro } from "@/components/sistema/pagina-cadastro"
import type { Coluna } from "@/components/tabela/tabela-dados"
import type { veiculos } from "@/db/gerado/schema"
import { formatNumero, formatPlaca, numeroParaCampo } from "@/lib/format"
import { TIPOS_VEICULO, veiculoSchema } from "@/lib/schemas/cadastros"
import { UFS } from "@/lib/uf"

import { ativarVeiculo, excluirVeiculo, salvarVeiculo } from "../actions"

type Veiculo = typeof veiculos.$inferSelect
type MotoristaOpcao = { id: string; nome: string }

const nomeTipo = (t: string) => TIPOS_VEICULO.find((x) => x.valor === t)?.rotulo ?? t

export function ListaVeiculos({
  dados,
  motoristas,
}: {
  dados: Veiculo[]
  motoristas: MotoristaOpcao[]
}) {
  const nomeMotorista = (id: string | null) => motoristas.find((m) => m.id === id)?.nome ?? ""

  const colunas: Coluna<Veiculo>[] = [
    {
      accessorKey: "placa",
      header: "Placa",
      cell: ({ row }) => (
        <span className="font-mono font-medium">{formatPlaca(row.original.placa)}</span>
      ),
    },
    { accessorKey: "tipo", header: "Tipo", cell: ({ row }) => nomeTipo(row.original.tipo) },
    {
      accessorKey: "taraKg",
      header: "Tara",
      cell: ({ row }) => (row.original.taraKg ? `${formatNumero(row.original.taraKg, 0)} kg` : "—"),
      meta: { className: "text-right tabular-nums" },
    },
    {
      id: "motorista",
      header: "Motorista padrão",
      accessorFn: (r) => nomeMotorista(r.motoristaPadraoId),
      meta: { className: "hidden md:table-cell" },
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
      textoBusca={(r) =>
        `${r.placa} ${formatPlaca(r.placa)} ${nomeTipo(r.tipo)} ${nomeMotorista(r.motoristaPadraoId)}`
      }
      buscaPlaceholder="Buscar por placa, tipo ou motorista"
      rotuloNovo="Novo veículo"
      tituloPainel={(r) => (r ? `Veículo ${formatPlaca(r.placa)}` : "Novo veículo")}
      formulario={(r, fechar) => (
        <FormularioCadastro
          schema={veiculoSchema}
          valoresIniciais={{
            placa: r?.placa ?? "",
            tipo: (r?.tipo ?? "truck") as "truck",
            taraKg: numeroParaCampo(r?.taraKg),
            uf: r?.uf ?? "",
            rntc: r?.rntc ?? "",
            motoristaPadraoId: r?.motoristaPadraoId ?? "",
          }}
          salvar={(v) => salvarVeiculo(r?.id ?? null, v)}
          excluir={r ? () => excluirVeiculo(r.id) : undefined}
          ativo={r ? { valor: r.ativo, alternar: () => ativarVeiculo(r.id, !r.ativo) } : undefined}
          aoConcluir={fechar}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <CampoTexto
              name="placa"
              label="Placa"
              autoFocus
              placeholder="ABC1D23"
              inputClassName="uppercase"
            />
            <CampoSelect name="tipo" label="Tipo" opcoes={[...TIPOS_VEICULO]} />
            <CampoNumero
              name="taraKg"
              label="Tara"
              sufixo="kg"
              descricao="Peso do caminhão vazio (usado na compra por tonelada)."
            />
            <CampoSelect
              name="uf"
              label="UF da placa"
              opcoes={UFS.map((u) => ({ valor: u, rotulo: u }))}
              permitirVazio
            />
            <CampoTexto name="rntc" label="RNTC (ANTT)" />
            <CampoSelect
              name="motoristaPadraoId"
              label="Motorista padrão"
              opcoes={motoristas.map((m) => ({ valor: m.id, rotulo: m.nome }))}
              permitirVazio
            />
          </div>
        </FormularioCadastro>
      )}
    />
  )
}
