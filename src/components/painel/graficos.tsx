"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts"

import { formatMoeda, formatNumero } from "@/lib/format"

// Cores por entidade (fixas): Pinus = madeira, Eucalipto = floresta; compras = azul, vendas = madeira.
const COR_ESPECIE: Record<string, string> = { Pinus: "var(--chart-1)", Eucalipto: "var(--chart-2)" }
const corEspecie = (nome: string, i: number) =>
  COR_ESPECIE[nome] ?? ["var(--chart-4)", "var(--chart-3)", "var(--chart-5)"][i % 3]!
const SEQ = ["var(--chart-seq-1)", "var(--chart-seq-2)", "var(--chart-seq-3)"]

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]
const rotuloMes = (iso: string) => {
  const [a, m] = iso.split("-")
  return `${MESES[Number(m) - 1]}/${a!.slice(2)}`
}
const moedaCurta = (v: number) =>
  v >= 1000 ? `R$ ${formatNumero(v / 1000, 0, v >= 10000 ? 0 : 1)} mil` : formatMoeda(v)

const EIXO = {
  stroke: "var(--muted-foreground)",
  fontSize: 12,
  tickLine: false,
  axisLine: false,
} as const

function Dica({
  active,
  payload,
  label,
  formato,
  rotulo,
}: TooltipContentProps<number, string> & {
  formato: (v: number) => string
  rotulo?: (l: string) => string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-popover rounded-lg border px-3 py-2 text-sm shadow-lg">
      <div className="mb-1 font-medium">{rotulo ? rotulo(String(label)) : label}</div>
      {payload.map((p) => (
        <div key={String(p.dataKey)} className="flex items-center gap-2">
          <span
            className="size-2.5 rounded-sm"
            style={{ background: p.color ?? (p.payload as { cor?: string })?.cor }}
          />
          <span className="text-muted-foreground">{p.name}</span>
          <span className="ml-auto pl-3 font-medium tabular-nums">{formato(Number(p.value))}</span>
        </div>
      ))}
    </div>
  )
}

function Vazio() {
  return (
    <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
      Sem dados no período.
    </div>
  )
}

export function GraficoComprasVendas({
  dados,
}: {
  dados: { mes: string; compras: number; vendas: number }[]
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={dados} barGap={2} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
        <XAxis dataKey="mes" tickFormatter={rotuloMes} {...EIXO} />
        <YAxis tickFormatter={moedaCurta} width={72} {...EIXO} />
        <Tooltip
          cursor={{ fill: "var(--muted)", opacity: 0.5 }}
          content={(p) => (
            <Dica
              {...(p as TooltipContentProps<number, string>)}
              formato={formatMoeda}
              rotulo={rotuloMes}
            />
          )}
        />
        <Legend
          verticalAlign="top"
          align="right"
          iconType="square"
          height={28}
          wrapperStyle={{ fontSize: 13 }}
          formatter={(v) => <span style={{ color: "var(--foreground)" }}>{v}</span>}
        />
        <Bar
          dataKey="compras"
          name="Compras de toras"
          fill="var(--chart-3)"
          radius={[4, 4, 0, 0]}
          maxBarSize={28}
        />
        <Bar
          dataKey="vendas"
          name="Vendas"
          fill="var(--chart-1)"
          radius={[4, 4, 0, 0]}
          maxBarSize={28}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function GraficoVendasEspecie({
  dados,
}: {
  dados: { especie: string; m3: number; valor: number }[]
}) {
  if (!dados.length) return <Vazio />
  const comCor = dados.map((d, i) => ({ ...d, cor: corEspecie(d.especie, i) }))
  return (
    <ResponsiveContainer width="100%" height={Math.max(120, dados.length * 56)}>
      <BarChart data={comCor} layout="vertical" margin={{ top: 0, right: 72, left: 8, bottom: 0 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="especie" width={84} {...EIXO} />
        <Tooltip
          cursor={{ fill: "var(--muted)", opacity: 0.5 }}
          content={(p) => (
            <Dica
              {...(p as TooltipContentProps<number, string>)}
              formato={(v) => `${formatNumero(v, 2, 3)} m³`}
            />
          )}
        />
        <Bar dataKey="m3" name="Vendido" radius={[0, 4, 4, 0]} maxBarSize={32}>
          {comCor.map((d) => (
            <Cell key={d.especie} fill={d.cor} />
          ))}
          <LabelList
            dataKey="m3"
            position="right"
            formatter={(v) => `${formatNumero(Number(v), 1, 1)} m³`}
            style={{ fill: "var(--foreground)", fontSize: 13 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function GraficoVendasQualidade({
  dados,
}: {
  dados: { qualidade: string; m3: number; valor: number }[]
}) {
  if (!dados.length) return <Vazio />
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={dados} margin={{ top: 24, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
        <XAxis dataKey="qualidade" {...EIXO} />
        <YAxis hide />
        <Tooltip
          cursor={{ fill: "var(--muted)", opacity: 0.5 }}
          content={(p) => (
            <Dica
              {...(p as TooltipContentProps<number, string>)}
              formato={(v) => `${formatNumero(v, 2, 3)} m³`}
            />
          )}
        />
        <Bar dataKey="m3" name="Vendido" radius={[4, 4, 0, 0]} maxBarSize={56}>
          {dados.map((d, i) => (
            <Cell key={d.qualidade} fill={SEQ[i] ?? SEQ[2]} />
          ))}
          <LabelList
            dataKey="m3"
            position="top"
            formatter={(v) => `${formatNumero(Number(v), 1, 1)} m³`}
            style={{ fill: "var(--foreground)", fontSize: 13 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

/** Estoque por espécie, empilhado por qualidade (rampa sequencial 1ª → 3ª). */
export function GraficoEstoque({
  dados,
}: {
  dados: { especie: string; qualidade: string; ordem: number; m3: number }[]
}) {
  if (!dados.length) return <Vazio />
  const qualidades = [...new Map(dados.map((d) => [d.qualidade, d.ordem])).entries()]
    .sort((a, b) => a[1] - b[1])
    .map(([q]) => q)
  const especies = [...new Set(dados.map((d) => d.especie))]
  const linhas = especies.map((e) => ({
    especie: e,
    ...Object.fromEntries(
      qualidades.map((q) => [q, dados.find((d) => d.especie === e && d.qualidade === q)?.m3 ?? 0])
    ),
  }))
  return (
    <ResponsiveContainer width="100%" height={Math.max(150, especies.length * 64 + 40)}>
      <BarChart data={linhas} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
        <XAxis type="number" tickFormatter={(v) => `${formatNumero(v, 0)} m³`} {...EIXO} />
        <YAxis type="category" dataKey="especie" width={84} {...EIXO} />
        <Tooltip
          cursor={{ fill: "var(--muted)", opacity: 0.5 }}
          content={(p) => (
            <Dica
              {...(p as TooltipContentProps<number, string>)}
              formato={(v) => `${formatNumero(v, 2, 3)} m³`}
            />
          )}
        />
        <Legend
          verticalAlign="top"
          align="right"
          iconType="square"
          height={28}
          wrapperStyle={{ fontSize: 13 }}
          formatter={(v) => <span style={{ color: "var(--foreground)" }}>{v}</span>}
        />
        {qualidades.map((q, i) => (
          <Bar
            key={q}
            dataKey={q}
            name={q}
            stackId="estoque"
            fill={SEQ[i] ?? SEQ[2]}
            stroke="var(--card)"
            strokeWidth={2}
            maxBarSize={36}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
