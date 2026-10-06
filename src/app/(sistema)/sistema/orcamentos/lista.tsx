"use client"

import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { AnimatePresence, motion } from "framer-motion"
import { Inbox, Mail, MapPin, MessageCircle, Package, Phone } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { orcamentosSite } from "@/db/gerado/schema"
import { formatDataHora, formatTelefone } from "@/lib/format"
import { cn } from "@/lib/utils"

import { mudarStatusOrcamento } from "./actions"

type Orcamento = typeof orcamentosSite.$inferSelect
type Status = Orcamento["status"]

const STATUS: Record<Status, { rotulo: string; classe: string }> = {
  novo: { rotulo: "Novo", classe: "bg-alerta/25 text-amber-800 dark:text-amber-200" },
  em_atendimento: {
    rotulo: "Em atendimento",
    classe: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  },
  concluido: { rotulo: "Concluído", classe: "bg-floresta/15 text-floresta" },
  descartado: { rotulo: "Descartado", classe: "bg-muted text-muted-foreground" },
}

function linkWhats(o: Orcamento) {
  const tel = o.telefone.replace(/\D/g, "")
  const msg = `Olá, ${o.nome.split(" ")[0]}! Aqui é da serraria, recebemos seu pedido de orçamento${o.produto ? ` de ${o.produto.toLowerCase()}` : ""}.`
  return `https://wa.me/${tel.length <= 11 ? `55${tel}` : tel}?text=${encodeURIComponent(msg)}`
}

export function CaixaOrcamentos({ dados }: { dados: Orcamento[] }) {
  const router = useRouter()
  const [filtro, setFiltro] = useState<Status | "">("novo")
  const [aberto, setAberto] = useState<string | null>(null)
  const [pendente, iniciar] = useTransition()
  const lista = filtro ? dados.filter((o) => o.status === filtro) : dados

  function mudar(id: string, status: Status) {
    iniciar(async () => {
      const r = await mudarStatusOrcamento(id, status)
      if (r.ok) {
        toast.success(`Marcado como ${STATUS[status].rotulo.toLowerCase()}.`)
        router.refresh()
      } else toast.error(r.erro)
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-card flex flex-wrap gap-1 self-start rounded-lg border p-1">
        {(["novo", "em_atendimento", "concluido", "descartado", ""] as const).map((s) => (
          <button
            key={s || "todos"}
            type="button"
            onClick={() => setFiltro(s)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm",
              filtro === s
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            {s ? STATUS[s].rotulo : "Todos"}
            <span className="ml-1.5 text-xs opacity-70">
              {s ? dados.filter((o) => o.status === s).length : dados.length}
            </span>
          </button>
        ))}
      </div>

      {lista.length === 0 ? (
        <div className="text-muted-foreground flex flex-col items-center gap-2 rounded-2xl border border-dashed p-12 text-center">
          <Inbox className="size-10" />
          Nenhum pedido aqui.
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {lista.map((o) => {
              const expandido = aberto === o.id
              return (
                <motion.li
                  key={o.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-card overflow-hidden rounded-2xl border"
                >
                  <button
                    type="button"
                    onClick={() => setAberto(expandido ? null : o.id)}
                    className="hover:bg-muted/40 flex w-full items-start gap-4 p-4 text-left"
                    aria-expanded={expandido}
                  >
                    <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-full font-semibold">
                      {o.nome[0]?.toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">{o.nome}</span>
                        <Badge variant="secondary" className={STATUS[o.status].classe}>
                          {STATUS[o.status].rotulo}
                        </Badge>
                      </span>
                      <span className="text-muted-foreground block truncate text-sm">
                        {[o.produto, o.cidade].filter(Boolean).join(" · ")}{" "}
                        {o.mensagem && `— ${o.mensagem}`}
                      </span>
                    </span>
                    <span
                      className="text-muted-foreground shrink-0 text-xs"
                      title={formatDataHora(o.createdAt)}
                    >
                      {formatDistanceToNow(new Date(o.createdAt), {
                        locale: ptBR,
                        addSuffix: true,
                      })}
                    </span>
                  </button>
                  <AnimatePresence>
                    {expandido && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-col gap-4 border-t p-4">
                          <dl className="grid gap-3 text-sm sm:grid-cols-2">
                            <div className="flex items-center gap-2">
                              <Phone className="text-muted-foreground size-4" />{" "}
                              {formatTelefone(o.telefone)}
                            </div>
                            {o.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="text-muted-foreground size-4" /> {o.email}
                              </div>
                            )}
                            {o.cidade && (
                              <div className="flex items-center gap-2">
                                <MapPin className="text-muted-foreground size-4" /> {o.cidade}
                              </div>
                            )}
                            {o.produto && (
                              <div className="flex items-center gap-2">
                                <Package className="text-muted-foreground size-4" /> {o.produto}
                              </div>
                            )}
                          </dl>
                          {o.mensagem && (
                            <p className="bg-muted/50 rounded-xl p-3 text-sm whitespace-pre-wrap">
                              {o.mensagem}
                            </p>
                          )}
                          <p className="text-muted-foreground text-xs">
                            Recebido em {formatDataHora(o.createdAt)}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Button asChild className="bg-[#25D366] text-white hover:bg-[#1ebe5b]">
                              <a
                                href={linkWhats(o)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => o.status === "novo" && mudar(o.id, "em_atendimento")}
                              >
                                <MessageCircle /> Responder no WhatsApp
                              </a>
                            </Button>
                            {(Object.keys(STATUS) as Status[])
                              .filter((s) => s !== o.status)
                              .map((s) => (
                                <Button
                                  key={s}
                                  variant="outline"
                                  disabled={pendente}
                                  onClick={() => mudar(o.id, s)}
                                >
                                  {STATUS[s].rotulo}
                                </Button>
                              ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>
      )}
    </div>
  )
}
