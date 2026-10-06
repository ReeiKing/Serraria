"use client"

import { Loader2, Undo2 } from "lucide-react"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { estornarProducaoProdutos } from "../../actions"

export function BotaoEstornoMontagem({ id }: { id: string }) {
  const router = useRouter()
  const [aberto, setAberto] = useState(false)
  const [motivo, setMotivo] = useState("")
  const [pendente, iniciar] = useTransition()

  function enviar(permitirNegativo: boolean) {
    iniciar(async () => {
      const r = await estornarProducaoProdutos(id, { motivo, permitirNegativo })
      if (r.ok) {
        toast.success("Montagem estornada.")
        setAberto(false)
        router.refresh()
      } else if (r.codigo === "ESTOQUE_NEGATIVO") {
        if (
          window.confirm(
            `${r.erro}\n\nParte das unidades já foi vendida. Estornar mesmo assim, deixando o saldo negativo?`
          )
        )
          enviar(true)
      } else toast.error(r.erro)
    })
  }

  return (
    <>
      <Button
        variant="outline"
        size="lg"
        className="text-destructive"
        onClick={() => setAberto(true)}
      >
        <Undo2 /> Estornar
      </Button>
      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Estornar montagem</DialogTitle>
            <DialogDescription>
              As unidades saem do estoque de produtos. Os lançamentos originais continuam no
              histórico.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="motivo">Motivo</Label>
            <Textarea
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ex.: lançada em duplicidade"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAberto(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={pendente || motivo.trim().length < 5}
              onClick={() => enviar(false)}
            >
              {pendente && <Loader2 className="animate-spin" />} Estornar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
