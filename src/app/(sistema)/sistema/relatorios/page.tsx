import Link from "next/link"

import { FiltroPeriodo } from "@/components/painel/filtro-periodo"
import { CabecalhoPagina } from "@/components/sistema/cabecalho-pagina"
import { comUsuario } from "@/db"
import { clientes } from "@/db"
import { opcoesCadastros } from "@/lib/consultas/opcoes"
import { TIPOS_RELATORIO, gerarRelatorio, totais } from "@/lib/relatorios"
import { ALINHA_DIREITA, formatarCelula } from "@/lib/relatorios-formato"
import { cn } from "@/lib/utils"
import { asc, eq } from "drizzle-orm"

import { BotoesExportar, FiltrosRelatorio } from "./filtros"
import { lerParametros, type ParamsRelatorio } from "./parametros"

export const metadata = { title: "Relatórios" }

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<ParamsRelatorio>
}) {
  const params = await searchParams
  const { tipo, filtros } = lerParametros(params)
  const def = TIPOS_RELATORIO.find((t) => t.valor === tipo)!

  const { relatorio, opcoes, listaClientes } = await comUsuario(async (tx) => {
    const [relatorio, opcoes, listaClientes] = await Promise.all([
      gerarRelatorio(tx, tipo, filtros),
      opcoesCadastros(tx),
      tx
        .select({ id: clientes.id, nome: clientes.razaoSocial })
        .from(clientes)
        .where(eq(clientes.ativo, true))
        .orderBy(asc(clientes.razaoSocial)),
    ])
    return { relatorio, opcoes, listaClientes }
  })
  const t = totais(relatorio)

  const camposFiltro = (def.filtros as readonly string[]).map((f) => {
    switch (f) {
      case "especie":
        return {
          nome: "especie",
          rotulo: "Espécie",
          opcoes: opcoes.especies.map((e) => ({ valor: e.id, rotulo: e.nome })),
        }
      case "fornecedor":
        return {
          nome: "fornecedor",
          rotulo: "Fornecedor",
          opcoes: opcoes.fornecedores.map((x) => ({ valor: x.valor, rotulo: x.rotulo })),
        }
      case "cliente":
        return {
          nome: "cliente",
          rotulo: "Cliente",
          opcoes: listaClientes.map((c) => ({ valor: c.id, rotulo: c.nome })),
        }
      default:
        return { nome: "motorista", rotulo: "Motorista", opcoes: opcoes.motoristas }
    }
  })

  const linkTipo = (valor: string) => {
    const q = new URLSearchParams(
      Object.entries(params).filter(
        (e): e is [string, string] => !!e[1] && ["periodo", "de", "ate"].includes(e[0])
      )
    )
    q.set("tipo", valor)
    return `/sistema/relatorios?${q.toString()}`
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <CabecalhoPagina
        titulo="Relatórios"
        descricao="Filtre, confira na tela e exporte para Excel ou PDF."
        acoes={<BotoesExportar />}
      />

      <nav
        aria-label="Tipo de relatório"
        className="bg-card flex flex-wrap gap-1 rounded-xl border p-1"
      >
        {TIPOS_RELATORIO.map((r) => (
          <Link
            key={r.valor}
            href={linkTipo(r.valor)}
            aria-current={r.valor === tipo ? "page" : undefined}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              r.valor === tipo
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            {r.rotulo}
          </Link>
        ))}
        <span
          className="text-muted-foreground cursor-not-allowed rounded-lg px-4 py-2 text-sm italic"
          title="Disponível quando a emissão de NF-e for ativada"
          aria-disabled="true"
        >
          NF-e emitidas (em breve)
        </span>
      </nav>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        {relatorio.usaPeriodo ? (
          <FiltroPeriodo periodo={filtros.periodo} />
        ) : (
          <p className="text-muted-foreground text-sm">{relatorio.subtitulo}</p>
        )}
        <FiltrosRelatorio campos={camposFiltro} />
      </div>

      <section className="bg-card overflow-hidden rounded-2xl border">
        <div className="flex items-baseline justify-between gap-2 border-b px-5 py-3">
          <h2 className="font-heading text-lg font-semibold">{relatorio.titulo}</h2>
          <span className="text-muted-foreground text-sm">{relatorio.linhas.length} registros</span>
        </div>
        <div
          className="focus-visible:ring-ring max-h-[65vh] overflow-auto focus-visible:ring-2 focus-visible:outline-none"
          tabIndex={0}
          role="region"
          aria-label={`Tabela: ${relatorio.titulo}`}
        >
          <table className="w-full text-sm">
            <thead className="bg-muted sticky top-0 z-10 text-left">
              <tr>
                {relatorio.colunas.map((c) => (
                  <th
                    key={c.chave}
                    className={cn(
                      "px-3 py-2 font-medium whitespace-nowrap",
                      ALINHA_DIREITA.has(c.tipo) && "text-right"
                    )}
                  >
                    {c.rotulo}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {relatorio.linhas.length === 0 && (
                <tr>
                  <td
                    colSpan={relatorio.colunas.length}
                    className="text-muted-foreground px-3 py-10 text-center"
                  >
                    Nenhum registro com esses filtros.
                  </td>
                </tr>
              )}
              {relatorio.linhas.map((l, k) => (
                <tr key={k} className="hover:bg-muted/40 border-t">
                  {relatorio.colunas.map((c) => (
                    <td
                      key={c.chave}
                      className={cn(
                        "px-3 py-2 whitespace-nowrap",
                        ALINHA_DIREITA.has(c.tipo) && "text-right"
                      )}
                    >
                      {formatarCelula(l[c.chave], c.tipo)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            {relatorio.linhas.length > 0 && (
              <tfoot className="bg-secondary sticky bottom-0 font-semibold">
                <tr className="border-primary border-t-2">
                  {relatorio.colunas.map((c, i) => (
                    <td
                      key={c.chave}
                      className={cn(
                        "px-3 py-2 whitespace-nowrap",
                        ALINHA_DIREITA.has(c.tipo) && "text-right"
                      )}
                    >
                      {i === 0 ? "Totais" : c.total ? formatarCelula(t[c.chave] ?? 0, c.tipo) : ""}
                    </td>
                  ))}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </section>
    </div>
  )
}
