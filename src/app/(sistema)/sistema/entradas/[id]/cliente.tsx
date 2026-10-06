"use client"

import { format } from "date-fns"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { CampoNumero, CampoSelect, CampoTexto } from "@/components/form/campos"
import { FormularioCadastro } from "@/components/form/formulario-cadastro"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { entradasTorasPagamentos } from "@/db/gerado/schema"
import { formatData, formatMoeda, numeroParaCampo } from "@/lib/format"
import { FORMAS_PAGAMENTO, pagamentoSchema } from "@/lib/schemas/entradas"

import { excluirEntrada, excluirPagamento, registrarPagamento } from "../actions"

type Pagamento = typeof entradasTorasPagamentos.$inferSelect

export function AcoesEntrada({ id }: { id: string }) {
  const router = useRouter()
  const [pendente, iniciar] = useTransition()
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="lg"
          className="text-destructive hover:text-destructive"
          disabled={pendente}
        >
          {pendente ? <Loader2 className="animate-spin" /> : <Trash2 />} Excluir
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir esta entrada?</AlertDialogTitle>
          <AlertDialogDescription>
            A carga sai do estoque de toras e os pagamentos lançados nela também são excluídos. A
            exclusão fica registrada na auditoria.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() =>
              iniciar(async () => {
                const r = await excluirEntrada(id)
                if (r.ok) {
                  toast.success("Entrada excluída.")
                  router.push("/sistema/entradas")
                } else toast.error(r.erro)
              })
            }
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

const nomeForma = (f: string) => FORMAS_PAGAMENTO.find((x) => x.valor === f)?.rotulo ?? f

export function Pagamentos({
  entradaId,
  pagamentos,
  restante,
}: {
  entradaId: string
  pagamentos: Pagamento[]
  restante: number
}) {
  const router = useRouter()
  const [aberto, setAberto] = useState(false)
  const [pendente, iniciar] = useTransition()

  return (
    <section className="bg-card rounded-2xl border p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-heading text-lg font-semibold">Pagamentos ao fornecedor</h2>
        {restante > 0.004 && (
          <Button size="lg" onClick={() => setAberto(true)}>
            <Plus /> Registrar pagamento
          </Button>
        )}
      </div>
      {pagamentos.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhum pagamento registrado.</p>
      ) : (
        <ul className="divide-y">
          {pagamentos.map((p) => (
            <li key={p.id} className="flex items-center gap-3 py-3">
              <div className="flex-1">
                <div className="font-medium tabular-nums">{formatMoeda(p.valor)}</div>
                <div className="text-muted-foreground text-xs">
                  {formatData(`${p.dataPagamento}T12:00:00`)} · {nomeForma(p.forma)}
                  {p.observacao && ` · ${p.observacao}`}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Excluir pagamento"
                disabled={pendente}
                onClick={() =>
                  iniciar(async () => {
                    const r = await excluirPagamento(p.id, entradaId)
                    if (r.ok) {
                      toast.success("Pagamento excluído.")
                      router.refresh()
                    } else toast.error(r.erro)
                  })
                }
              >
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar pagamento</DialogTitle>
            <DialogDescription>Saldo a pagar: {formatMoeda(restante)}</DialogDescription>
          </DialogHeader>
          <FormularioCadastro
            schema={pagamentoSchema}
            valoresIniciais={{
              dataPagamento: format(new Date(), "yyyy-MM-dd"),
              valor: numeroParaCampo(restante.toFixed(2)),
              forma: "pix",
              observacao: "",
            }}
            salvar={(v) => registrarPagamento(entradaId, v)}
            mensagemSucesso="Pagamento registrado."
            aoConcluir={() => {
              setAberto(false)
              router.refresh()
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <CampoNumero name="valor" label="Valor" sufixo="R$" />
              <CampoTexto name="dataPagamento" label="Data" type="date" />
              <CampoSelect name="forma" label="Forma" opcoes={[...FORMAS_PAGAMENTO]} />
              <CampoTexto name="observacao" label="Observação" />
            </div>
          </FormularioCadastro>
        </DialogContent>
      </Dialog>
    </section>
  )
}
