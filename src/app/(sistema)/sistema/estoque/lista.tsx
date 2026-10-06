"use client"

import { motion } from "framer-motion"
import { Plus, SlidersHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { DialogoAjuste } from "@/components/sistema/dialogo-ajuste"
import { TabelaDados, type Coluna } from "@/components/tabela/tabela-dados"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { formatBitola, formatM3, formatMoeda } from "@/lib/format"
import { normalizarBitola } from "@/lib/producao"
import { cn } from "@/lib/utils"

type Opcao = { id: string; nome: string }
type Situacao = "ok" | "baixo" | "zerado" | "negativo"
type Item = {
  id: string
  especieId: string
  especie: string
  qualidadeId: string
  qualidade: string
  espessuraCm: string
  larguraCm: string
  comprimentoM: string
  saldoPecas: number
  saldoM3: string | null
  estoqueMinimoPecas: number
  precoM3: string | null
  valorEstimado: number | null
  situacao: Situacao
}

export function BadgeSituacao({ situacao }: { situacao: Situacao }) {
  const mapa: Record<Situacao, [string, string]> = {
    ok: ["OK", "bg-floresta/15 text-floresta"],
    baixo: ["Baixo", "bg-alerta/25 text-amber-800 dark:text-amber-200"],
    zerado: ["Zerado", "bg-muted text-muted-foreground"],
    negativo: ["Negativo", "bg-destructive/15 text-red-700 dark:text-red-300"],
  }
  const [rotulo, classe] = mapa[situacao]
  return (
    <Badge variant="secondary" className={cn("font-medium", classe)}>
      {situacao === "baixo" && (
        <motion.span
          className="mr-1 inline-block size-1.5 rounded-full bg-current"
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      )}
      {rotulo}
    </Badge>
  )
}

const colunas: Coluna<Item>[] = [
  { accessorKey: "especie", header: "Espécie" },
  {
    id: "bitola",
    header: "Bitola (cm × cm × m)",
    accessorFn: (i) =>
      Number(i.espessuraCm) * 1e6 + Number(i.larguraCm) * 1e3 + Number(i.comprimentoM),
    cell: ({ row: { original: i } }) => (
      <span className="font-medium tabular-nums">
        {formatBitola(i.espessuraCm, i.larguraCm, i.comprimentoM)}
      </span>
    ),
  },
  { accessorKey: "qualidade", header: "Qualidade" },
  {
    accessorKey: "saldoPecas",
    header: "Peças",
    meta: { className: "text-right tabular-nums" },
    cell: ({ row: { original: i } }) => (
      <span className={cn("font-semibold", i.saldoPecas < 0 && "text-destructive")}>
        {i.saldoPecas.toLocaleString("pt-BR")}
      </span>
    ),
  },
  {
    accessorKey: "saldoM3",
    header: "m³",
    sortFn: "basic",
    meta: { className: "text-right tabular-nums" },
    cell: ({ row }) => formatM3(row.original.saldoM3),
  },
  {
    accessorKey: "valorEstimado",
    header: "Valor estimado",
    sortFn: "basic",
    meta: { className: "text-right tabular-nums hidden md:table-cell" },
    cell: ({ row }) =>
      row.original.valorEstimado === null ? "—" : formatMoeda(row.original.valorEstimado),
  },
  {
    accessorKey: "situacao",
    header: "Situação",
    cell: ({ row }) => <BadgeSituacao situacao={row.original.situacao} />,
  },
]

function Chips({
  opcoes,
  valor,
  aoMudar,
}: {
  opcoes: Opcao[]
  valor: string
  aoMudar: (v: string) => void
}) {
  return (
    <div className="bg-card flex flex-wrap gap-1 rounded-lg border p-1">
      {[{ id: "", nome: "Todas" }, ...opcoes].map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => aoMudar(o.id)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm transition-colors",
            valor === o.id
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          {o.nome}
        </button>
      ))}
    </div>
  )
}

export function ListaEstoque({
  dados,
  especies,
  qualidades,
}: {
  dados: Item[]
  especies: Opcao[]
  qualidades: Opcao[]
}) {
  const router = useRouter()
  const [especie, setEspecie] = useState("")
  const [qualidade, setQualidade] = useState("")
  const [comSaldo, setComSaldo] = useState(true)
  const [soBaixo, setSoBaixo] = useState(false)
  const [ajuste, setAjuste] = useState(false)

  const filtrados = dados.filter(
    (i) =>
      (!especie || i.especieId === especie) &&
      (!qualidade || i.qualidadeId === qualidade) &&
      (!comSaldo || i.saldoPecas !== 0) &&
      (!soBaixo || i.situacao === "baixo" || i.situacao === "negativo")
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <Chips opcoes={especies} valor={especie} aoMudar={setEspecie} />
        <Chips opcoes={qualidades} valor={qualidade} aoMudar={setQualidade} />
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={comSaldo} onCheckedChange={setComSaldo} /> Só com saldo
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={soBaixo} onCheckedChange={setSoBaixo} /> Só estoque baixo
        </label>
      </div>
      <TabelaDados
        dados={filtrados}
        colunas={colunas}
        buscaPlaceholder="Buscar medida, ex.: 1,8 x 9"
        textoBusca={(i) => {
          const b = formatBitola(i.espessuraCm, i.larguraCm, i.comprimentoM)
          return `${i.especie} ${i.qualidade} ${normalizarBitola(b)} ${b}`
        }}
        normalizarBusca={normalizarBitola}
        aoClicarLinha={(i) => router.push(`/sistema/estoque/${i.id}`)}
        tamanhoPagina={50}
        vazio="Nenhum item com esses filtros. Lance uma produção para gerar estoque."
        acoes={
          <>
            <Button variant="outline" size="lg" onClick={() => setAjuste(true)}>
              <SlidersHorizontal /> Ajuste
            </Button>
            <Button size="lg" onClick={() => router.push("/sistema/producao/nova")}>
              <Plus /> Produção
            </Button>
          </>
        }
      />
      <DialogoAjuste
        aberto={ajuste}
        aoFechar={() => setAjuste(false)}
        item={null}
        especies={especies}
        qualidades={qualidades}
      />
    </div>
  )
}
