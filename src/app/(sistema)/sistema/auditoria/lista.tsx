"use client"

import { ChevronDown } from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { formatDataHora } from "@/lib/format"
import { cn } from "@/lib/utils"

export type RegistroAuditoria = {
  id: number
  tabela: string
  registro_id: string
  acao: "INSERT" | "UPDATE" | "DELETE"
  created_at: string
  usuario: string | null
  dados_antes: Record<string, unknown> | null
  dados_depois: Record<string, unknown> | null
}

const TABELAS: Record<string, string> = {
  usuarios: "Usuário",
  empresas: "Empresa",
  fornecedores: "Fornecedor",
  clientes: "Cliente",
  motoristas: "Motorista",
  veiculos: "Veículo",
  especies: "Espécie",
  qualidades: "Qualidade",
  tabela_precos: "Preço",
  entradas_toras: "Entrada de toras",
  entradas_toras_itens: "Tora medida",
  entradas_toras_pagamentos: "Pagamento",
  estoque_toras_mov: "Movimento de toras",
  estoque_itens: "Item de estoque",
  estoque_mov: "Movimento de estoque",
  producoes: "Produção",
  producoes_itens: "Peças da produção",
  vendas: "Venda",
  vendas_itens: "Item da venda",
  romaneios: "Romaneio",
  notas_fiscais: "NF-e",
  nfe_eventos: "Evento da NF-e",
  orcamentos_site: "Orçamento do site",
}
const ACOES = {
  INSERT: { rotulo: "Criou", classe: "bg-floresta/15 text-floresta" },
  UPDATE: { rotulo: "Alterou", classe: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
  DELETE: { rotulo: "Excluiu", classe: "bg-destructive/15 text-red-700 dark:text-red-300" },
}
const IGNORAR = new Set(["updated_at", "updated_by", "created_by"])

function resumo(r: RegistroAuditoria) {
  const d = (r.dados_depois ?? r.dados_antes ?? {}) as Record<string, unknown>
  const nome = d.nome ?? d.razao_social ?? d.descricao ?? d.placa
  const numero = d.numero ? `nº ${d.numero}` : null
  return [numero, nome].filter(Boolean).join(" · ")
}

function Diferencas({ r }: { r: RegistroAuditoria }) {
  const antes = r.dados_antes ?? {}
  const depois = r.dados_depois ?? {}
  const chaves = [...new Set([...Object.keys(antes), ...Object.keys(depois)])].filter(
    (k) =>
      !IGNORAR.has(k) &&
      (r.acao !== "UPDATE" || JSON.stringify(antes[k]) !== JSON.stringify(depois[k]))
  )
  if (!chaves.length)
    return (
      <p className="text-muted-foreground text-sm">
        Sem mudanças de conteúdo (apenas carimbo de data).
      </p>
    )
  const mostrar = (v: unknown) =>
    v === null || v === undefined || v === ""
      ? "—"
      : typeof v === "object"
        ? JSON.stringify(v)
        : String(v)
  return (
    <table className="w-full text-xs">
      <thead className="text-muted-foreground text-left">
        <tr>
          <th className="py-1 pr-2 font-medium">Campo</th>
          {r.acao !== "INSERT" && <th className="py-1 pr-2 font-medium">Antes</th>}
          {r.acao !== "DELETE" && (
            <th className="py-1 font-medium">{r.acao === "UPDATE" ? "Depois" : "Valor"}</th>
          )}
        </tr>
      </thead>
      <tbody className="font-mono">
        {chaves.map((k) => (
          <tr key={k} className="border-t align-top">
            <td className="text-muted-foreground py-1 pr-2 font-sans">{k}</td>
            {r.acao !== "INSERT" && (
              <td
                className={cn(
                  "py-1 pr-2 break-all",
                  r.acao === "UPDATE" && "text-destructive line-through"
                )}
              >
                {mostrar(antes[k])}
              </td>
            )}
            {r.acao !== "DELETE" && (
              <td className={cn("py-1 break-all", r.acao === "UPDATE" && "text-floresta")}>
                {mostrar(depois[k])}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function ListaAuditoria({ registros }: { registros: RegistroAuditoria[] }) {
  const [busca, setBusca] = useState("")
  const [aberto, setAberto] = useState<number | null>(null)
  const q = busca.toLowerCase()
  const lista = q
    ? registros.filter((r) =>
        `${TABELAS[r.tabela] ?? r.tabela} ${r.usuario ?? ""} ${resumo(r)} ${ACOES[r.acao].rotulo}`
          .toLowerCase()
          .includes(q)
      )
    : registros

  return (
    <div className="flex flex-col gap-3">
      <Input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Filtrar por usuário, tipo de registro, ação…"
        className="h-10 max-w-md"
      />
      <ul className="bg-card divide-y rounded-2xl border">
        {lista.length === 0 && (
          <li className="text-muted-foreground p-8 text-center">Nenhum registro no período.</li>
        )}
        {lista.slice(0, 300).map((r) => (
          <li key={r.id}>
            <button
              type="button"
              onClick={() => setAberto(aberto === r.id ? null : r.id)}
              className="hover:bg-muted/40 flex w-full items-center gap-3 px-4 py-3 text-left text-sm"
              aria-expanded={aberto === r.id}
            >
              <Badge
                variant="secondary"
                className={cn("w-16 justify-center", ACOES[r.acao].classe)}
              >
                {ACOES[r.acao].rotulo}
              </Badge>
              <span className="min-w-0 flex-1 truncate">
                <span className="font-medium">{TABELAS[r.tabela] ?? r.tabela}</span>
                {resumo(r) && <span className="text-muted-foreground"> · {resumo(r)}</span>}
              </span>
              <span className="text-muted-foreground hidden sm:inline">
                {r.usuario ?? "Sistema"}
              </span>
              <span className="text-muted-foreground text-xs whitespace-nowrap tabular-nums">
                {formatDataHora(r.created_at)}
              </span>
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 transition-transform",
                  aberto === r.id && "rotate-180"
                )}
              />
            </button>
            {aberto === r.id && (
              <div className="bg-muted/30 px-4 py-3">
                <Diferencas r={r} />
              </div>
            )}
          </li>
        ))}
      </ul>
      {lista.length > 300 && (
        <p className="text-muted-foreground text-sm">
          Mostrando 300 de {lista.length}. Refine o período.
        </p>
      )}
    </div>
  )
}
