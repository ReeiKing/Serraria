"use client"

import { Bell, SlidersHorizontal } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { z } from "zod"

import { CampoNumero } from "@/components/form/campos"
import { FormularioCadastro } from "@/components/form/formulario-cadastro"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatDataHora } from "@/lib/format"
import { MOTIVOS_AJUSTE } from "@/lib/schemas/producao"
import { cn } from "@/lib/utils"
import { zInteiro } from "@/lib/validacao"

import { definirMinimoProduto } from "../../actions"
import { DialogoAjusteProduto } from "../../produtos"

type Mov = {
  id: string
  createdAt: string
  tipo: string
  quantidade: number
  saldoApos: number | null
  motivo: string | null
  observacao: string | null
  usuario: string | null
  producaoId: string | null
  producaoNumero: number | null
  vendaId: string | null
  vendaNumero: number | null
}

const minimoSchema = z.object({ minimo: zInteiro({ min: 0, rotulo: "Mínimo" }) })

export function AcoesProduto({ id, nome, minimo }: { id: string; nome: string; minimo: number }) {
  const [ajuste, setAjuste] = useState(false)
  const [editMin, setEditMin] = useState(false)
  return (
    <>
      <Button variant="outline" size="lg" onClick={() => setEditMin(true)}>
        <Bell /> Estoque mínimo
      </Button>
      <Button size="lg" onClick={() => setAjuste(true)}>
        <SlidersHorizontal /> Ajustar
      </Button>
      <DialogoAjusteProduto
        aberto={ajuste}
        aoFechar={() => setAjuste(false)}
        produtos={[{ id, nome }]}
        produtoId={id}
      />
      <Dialog open={editMin} onOpenChange={setEditMin}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Estoque mínimo</DialogTitle>
            <DialogDescription>
              Abaixo desse número de unidades, o produto aparece como “Baixo”. Use 0 para desligar.
            </DialogDescription>
          </DialogHeader>
          <FormularioCadastro
            schema={minimoSchema}
            valoresIniciais={{ minimo: String(minimo) }}
            salvar={(v) => definirMinimoProduto(id, v)}
            aoConcluir={() => setEditMin(false)}
          >
            <CampoNumero name="minimo" label="Mínimo (unidades)" autoFocus />
          </FormularioCadastro>
        </DialogContent>
      </Dialog>
    </>
  )
}

const NOME_TIPO: Record<string, string> = {
  producao: "Montagem",
  venda: "Venda",
  estorno_venda: "Estorno de venda",
  ajuste: "Ajuste",
}
const nomeMotivo = (m: string | null) => MOTIVOS_AJUSTE.find((x) => x.valor === m)?.rotulo ?? ""

export function KardexProduto({ movs }: { movs: Mov[] }) {
  return (
    <section className="bg-card rounded-2xl border p-5">
      <h2 className="font-heading mb-3 text-lg font-semibold">Histórico de movimentações</h2>
      {movs.length === 0 ? (
        <p className="text-muted-foreground text-sm">Sem movimentações.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground text-left">
              <tr>
                <th className="py-2 font-medium">Data/hora</th>
                <th className="font-medium">Movimento</th>
                <th className="text-right font-medium">Qtd.</th>
                <th className="text-right font-medium">Saldo</th>
                <th className="hidden font-medium md:table-cell">Usuário</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {movs.map((m) => (
                <tr key={m.id} className="border-t align-top">
                  <td className="py-2 whitespace-nowrap">{formatDataHora(m.createdAt)}</td>
                  <td className="py-2">
                    <div className="font-medium">
                      {NOME_TIPO[m.tipo] ?? m.tipo}
                      {m.producaoId && (
                        <Link
                          href={`/sistema/producao/produtos/${m.producaoId}`}
                          className="text-primary ml-1 hover:underline"
                        >
                          nº {m.producaoNumero}
                        </Link>
                      )}
                      {m.vendaId && (
                        <Link
                          href={`/sistema/vendas/${m.vendaId}`}
                          className="text-primary ml-1 hover:underline"
                        >
                          nº {m.vendaNumero}
                        </Link>
                      )}
                      {m.motivo && (
                        <span className="text-muted-foreground"> · {nomeMotivo(m.motivo)}</span>
                      )}
                    </div>
                    {m.observacao && (
                      <div className="text-muted-foreground text-xs">{m.observacao}</div>
                    )}
                  </td>
                  <td
                    className={cn(
                      "py-2 text-right font-semibold",
                      m.quantidade > 0 ? "text-floresta" : "text-destructive"
                    )}
                  >
                    {m.quantidade > 0 ? "+" : "−"}
                    {Math.abs(m.quantidade).toLocaleString("pt-BR")}
                  </td>
                  <td className="py-2 text-right">{m.saldoApos?.toLocaleString("pt-BR")}</td>
                  <td className="hidden py-2 md:table-cell">{m.usuario}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
