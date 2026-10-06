"use client"

import { motion } from "framer-motion"
import {
  Ban,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  Pencil,
  Printer,
  Trash2,
  Truck,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Resultado } from "@/lib/acoes"
import { formatDataHora } from "@/lib/format"
import { cn } from "@/lib/utils"

import { cancelarVenda, confirmarVenda, excluirRascunho, marcarEntregue } from "../actions"

type Status = "rascunho" | "confirmada" | "nfe_emitida" | "entregue" | "cancelada"

export function AcoesVenda({
  id,
  status,
  temRomaneio,
}: {
  id: string
  status: Status
  temRomaneio: boolean
}) {
  const router = useRouter()
  const [pendente, iniciar] = useTransition()
  const [cancelando, setCancelando] = useState(false)
  const [motivo, setMotivo] = useState("")

  function rodar(fn: () => Promise<Resultado<unknown>>, ok: string, depois?: () => void) {
    iniciar(async () => {
      const r = await fn()
      if (r.ok) {
        toast.success(ok)
        if (depois) depois()
        else router.refresh()
      } else if (r.codigo === "ESTOQUE_NEGATIVO") {
        if (window.confirm(`${r.erro}.\n\nConfirmar a venda mesmo assim?`))
          rodar(() => confirmarVenda(id, true), ok, depois)
      } else toast.error(r.erro)
    })
  }

  const pdf = `/sistema/vendas/${id}/romaneio`

  return (
    <>
      {status === "rascunho" && (
        <>
          <Button
            variant="ghost"
            size="lg"
            className="text-destructive"
            disabled={pendente}
            onClick={() =>
              window.confirm("Excluir este rascunho?") &&
              rodar(
                () => excluirRascunho(id),
                "Rascunho excluído.",
                () => router.push("/sistema/vendas")
              )
            }
          >
            <Trash2 /> Excluir
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href={`/sistema/vendas/${id}/editar`}>
              <Pencil /> Editar
            </Link>
          </Button>
          <Button
            size="lg"
            disabled={pendente}
            onClick={() =>
              rodar(() => confirmarVenda(id, false), "Venda confirmada e romaneio gerado.")
            }
          >
            {pendente ? <Loader2 className="animate-spin" /> : <CheckCircle2 />} Confirmar venda
          </Button>
        </>
      )}
      {temRomaneio && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="lg">
              <FileText /> Romaneio
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <a href={pdf} target="_blank" rel="noreferrer">
                <Printer /> Abrir e imprimir
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={`${pdf}?baixar`}>
                <Download /> Baixar PDF
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {(status === "confirmada" || status === "nfe_emitida") && (
        <Button
          size="lg"
          variant="secondary"
          disabled={pendente}
          onClick={() => rodar(() => marcarEntregue(id), "Entrega registrada.")}
        >
          <Truck /> Marcar entregue
        </Button>
      )}
      {status === "confirmada" && (
        <Button
          variant="ghost"
          size="lg"
          className="text-destructive"
          onClick={() => setCancelando(true)}
        >
          <Ban /> Cancelar
        </Button>
      )}

      <Dialog open={cancelando} onOpenChange={setCancelando}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar venda</DialogTitle>
            <DialogDescription>
              As peças voltam ao estoque. O romaneio fica no histórico marcado como cancelado.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="motivo">Motivo</Label>
            <Textarea
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ex.: cliente desistiu da carga"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCancelando(false)}>
              Voltar
            </Button>
            <Button
              variant="destructive"
              disabled={pendente || motivo.trim().length < 5}
              onClick={() =>
                rodar(
                  () => cancelarVenda(id, { motivo }),
                  "Venda cancelada; peças devolvidas ao estoque.",
                  () => (setCancelando(false), router.refresh())
                )
              }
            >
              Cancelar venda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

const ETAPAS = [
  { chave: "criada", rotulo: "Rascunho" },
  { chave: "confirmada", rotulo: "Confirmada" },
  { chave: "nfe", rotulo: "NF-e emitida" },
  { chave: "entregue", rotulo: "Entregue" },
] as const

const ORDEM: Record<Status, number> = {
  rascunho: 0,
  confirmada: 1,
  nfe_emitida: 2,
  entregue: 3,
  cancelada: -1,
}

export function LinhaDoTempo({
  status,
  datas,
}: {
  status: Status
  datas: Record<(typeof ETAPAS)[number]["chave"], string | null>
}) {
  if (status === "cancelada") return null
  const atual = ORDEM[status]
  return (
    <ol className="bg-card relative grid grid-cols-4 gap-2 rounded-2xl border p-4">
      <div className="bg-muted absolute top-[30px] right-[12.5%] left-[12.5%] h-1 rounded-full" />
      <motion.div
        className="to-primary absolute top-[30px] left-[12.5%] h-1 origin-left rounded-full bg-gradient-to-r from-amber-500"
        style={{ width: "75%" }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: atual / 3 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
      {ETAPAS.map((e, i) => {
        const feito = i <= atual
        return (
          <li key={e.chave} className="relative flex flex-col items-center gap-1 text-center">
            <motion.span
              initial={{ scale: 0.6 }}
              animate={{ scale: i === atual ? [1, 1.15, 1] : 1 }}
              transition={{ delay: 0.15 * i, duration: 0.5 }}
              className={cn(
                "z-10 flex size-7 items-center justify-center rounded-full border-2 text-xs font-bold",
                feito
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground"
              )}
            >
              {i + 1}
            </motion.span>
            <span
              className={cn("text-xs font-medium sm:text-sm", !feito && "text-muted-foreground")}
            >
              {e.rotulo}
            </span>
            {datas[e.chave] && feito && (
              <span className="text-muted-foreground text-[11px]">
                {formatDataHora(datas[e.chave]!)}
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
}
