"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { AnimatePresence, motion } from "framer-motion"
import { Copy, Loader2, Plus, Save, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import {
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
  useWatch,
  type Resolver,
} from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"

import { CampoNumero, CampoTexto, CampoTextoLongo } from "@/components/form/campos"
import { EscolhaCartoes, Secao } from "@/components/sistema/escolha-cartoes"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  formatBitola,
  formatM3,
  formatNumero,
  formatPercentual,
  numeroParaCampo,
} from "@/lib/format"
import { calcularProducao, corRendimento } from "@/lib/producao"
import { producaoSchema } from "@/lib/schemas/producao"
import { cn } from "@/lib/utils"

import { salvarProducao } from "./actions"

type Valores = z.input<typeof producaoSchema>
type Opcao = { id: string; nome: string }
export type BitolaExistente = {
  especieId: string
  qualidadeId: string
  espessuraCm: string
  larguraCm: string
  comprimentoM: string
  saldoPecas: number
}

const useFormContextTipado = () => useFormContext<Valores>()

const LINHA_VAZIA = {
  espessuraCm: "",
  larguraCm: "",
  comprimentoM: "",
  qualidadeId: "",
  quantidade: "",
}

function TabelaPecas({ qualidades, bitolas }: { qualidades: Opcao[]; bitolas: BitolaExistente[] }) {
  const { fields, append, remove } = useFieldArray<Valores, "itens">({ name: "itens" })
  const itens = useWatch<Valores, "itens">({ name: "itens" })
  const especieId = useWatch<Valores, "especieId">({ name: "especieId" })
  const form = useFormContextTipado()
  const calc = calcularProducao(itens ?? [])
  const erros = form.formState.errors.itens
  const qualidadePadrao = qualidades[0]?.id ?? ""
  const daEspecie = bitolas.filter((b) => b.especieId === especieId)

  return (
    <div className="flex flex-col gap-3">
      <div className="text-muted-foreground hidden grid-cols-[0.8fr_0.8fr_0.9fr_1.1fr_0.9fr_1fr_auto] gap-2 px-1 text-xs font-medium md:grid">
        <span>Espessura (cm)</span>
        <span>Largura (cm)</span>
        <span>Compr. (m)</span>
        <span>Qualidade</span>
        <span>Peças</span>
        <span className="text-right">Volume</span>
        <span className="w-10" />
      </div>
      <AnimatePresence initial={false}>
        {fields.map((f, i) => {
          const e = erros?.[i]
          const linha = calc.linhas[i]
          return (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-muted/30 grid grid-cols-3 items-start gap-2 rounded-xl border p-2 md:grid-cols-[0.8fr_0.8fr_0.9fr_1.1fr_0.9fr_1fr_auto] md:border-0 md:bg-transparent md:p-0"
            >
              {(
                [
                  ["espessuraCm", "Esp. (cm)", "1,8"],
                  ["larguraCm", "Larg. (cm)", "9"],
                  ["comprimentoM", "Compr. (m)", "1,20"],
                ] as const
              ).map(([campo, rotulo, ex]) => (
                <div key={campo}>
                  <span className="text-muted-foreground mb-1 block text-xs md:hidden">
                    {rotulo}
                  </span>
                  <Input
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder={ex}
                    aria-label={`${rotulo} da linha ${i + 1}`}
                    aria-invalid={!!e?.[campo]}
                    className="h-11 text-base tabular-nums"
                    {...form.register(`itens.${i}.${campo}`, {
                      onChange: (ev) => (ev.target.value = ev.target.value.replace(/[^\d.,]/g, "")),
                    })}
                  />
                </div>
              ))}
              <div className="col-span-2 md:col-span-1">
                <span className="text-muted-foreground mb-1 block text-xs md:hidden">
                  Qualidade
                </span>
                <Select
                  value={itens?.[i]?.qualidadeId || ""}
                  onValueChange={(v) =>
                    form.setValue(`itens.${i}.qualidadeId`, v, { shouldValidate: true })
                  }
                >
                  <SelectTrigger
                    className="h-11 w-full"
                    aria-label={`Qualidade da linha ${i + 1}`}
                    aria-invalid={!!e?.qualidadeId}
                  >
                    <SelectValue placeholder="Qualidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {qualidades.map((q) => (
                      <SelectItem key={q.id} value={q.id}>
                        {q.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <span className="text-muted-foreground mb-1 block text-xs md:hidden">Peças</span>
                <Input
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="0"
                  aria-label={`Peças da linha ${i + 1}`}
                  aria-invalid={!!e?.quantidade}
                  className="h-11 text-base tabular-nums"
                  {...form.register(`itens.${i}.quantidade`, {
                    onChange: (ev) => (ev.target.value = ev.target.value.replace(/\D/g, "")),
                  })}
                />
              </div>
              <div className="col-span-2 flex h-11 flex-col justify-center text-sm tabular-nums md:col-span-1 md:items-end">
                <span className="font-semibold">{formatM3(linha?.volumeTotalM3 ?? 0)} m³</span>
                <span className="text-muted-foreground text-xs">
                  {formatM3(linha?.volumePecaM3 ?? 0)} m³/peça
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive size-11 justify-self-end"
                onClick={() => remove(i)}
                disabled={fields.length === 1}
                aria-label={`Remover linha ${i + 1}`}
              >
                <Trash2 />
              </Button>
              {e && (
                <p className="text-destructive col-span-full text-sm">
                  {e.espessuraCm?.message ??
                    e.larguraCm?.message ??
                    e.comprimentoM?.message ??
                    e.qualidadeId?.message ??
                    e.quantidade?.message}
                </p>
              )}
            </motion.div>
          )
        })}
      </AnimatePresence>
      {erros?.root?.message && <FieldError>{erros.root.message}</FieldError>}
      {erros?.message && <FieldError>{erros.message}</FieldError>}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-12"
          onClick={() => append({ ...LINHA_VAZIA, qualidadeId: qualidadePadrao })}
        >
          <Plus /> Adicionar linha
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="h-12"
          onClick={() => {
            const u = itens?.[itens.length - 1]
            append(u ? { ...u, quantidade: "" } : { ...LINHA_VAZIA, qualidadeId: qualidadePadrao })
          }}
        >
          <Copy /> Repetir medida
        </Button>
        {daEspecie.length > 0 && (
          <Select
            value=""
            onValueChange={(v) => {
              const b = daEspecie[Number(v)]!
              const vazia = (itens ?? []).findIndex(
                (l) => !l.espessuraCm && !l.larguraCm && !l.comprimentoM
              )
              const linha = {
                espessuraCm: numeroParaCampo(b.espessuraCm),
                larguraCm: numeroParaCampo(b.larguraCm),
                comprimentoM: numeroParaCampo(b.comprimentoM),
                qualidadeId: b.qualidadeId,
                quantidade: "",
              }
              if (vazia >= 0) form.setValue(`itens.${vazia}`, linha)
              else append(linha)
            }}
          >
            <SelectTrigger className="h-12 w-auto min-w-56">
              <SelectValue placeholder="Usar bitola do estoque…" />
            </SelectTrigger>
            <SelectContent>
              {daEspecie.map((b, i) => (
                <SelectItem key={i} value={String(i)}>
                  {formatBitola(b.espessuraCm, b.larguraCm, b.comprimentoM)} ·{" "}
                  {qualidades.find((q) => q.id === b.qualidadeId)?.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  )
}

export function FormularioProducao({
  especies,
  qualidades,
  bitolas,
  torasPorEspecie,
  hoje,
}: {
  especies: Opcao[]
  qualidades: Opcao[]
  bitolas: BitolaExistente[]
  torasPorEspecie: Record<string, number>
  hoje: string
}) {
  const router = useRouter()
  const [pendente, iniciar] = useTransition()
  const form = useForm<Valores>({
    resolver: zodResolver(producaoSchema) as unknown as Resolver<Valores>,
    defaultValues: {
      dataProducao: hoje,
      especieId: especies[0]?.id ?? "",
      torasConsumidasM3: "",
      observacoes: "",
      itens: [{ ...LINHA_VAZIA, qualidadeId: qualidades[0]?.id ?? "" }],
    },
    mode: "onTouched",
  })
  const v = useWatch({ control: form.control }) as Valores
  const calc = calcularProducao(v.itens ?? [], v.torasConsumidasM3)
  const saldoToras = torasPorEspecie[v.especieId] ?? 0

  const onSubmit = form.handleSubmit(
    () =>
      iniciar(async () => {
        const r = await salvarProducao(form.getValues())
        if (r.ok) {
          toast.success("Produção lançada! As peças já entraram no estoque.")
          router.push(`/sistema/producao/${r.dados.id}`)
          router.refresh()
        } else toast.error(r.erro)
      }),
    () => toast.error("Confira os campos destacados.")
  )

  return (
    <FormProvider {...form}>
      <form
        onSubmit={onSubmit}
        noValidate
        className="grid gap-6 pb-28 lg:grid-cols-[1fr_320px] lg:pb-0"
      >
        <div className="flex flex-col gap-6">
          <Secao titulo="Produção">
            <EscolhaCartoes
              nome="especie"
              valor={v.especieId}
              opcoes={especies.map((e) => ({ valor: e.id, rotulo: e.nome }))}
              aoMudar={(id) => form.setValue("especieId", id, { shouldValidate: true })}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <CampoTexto name="dataProducao" label="Data da produção" type="date" />
              <CampoNumero
                name="torasConsumidasM3"
                label="Toras consumidas"
                sufixo="m³"
                placeholder="0,000"
                descricao={`Em estoque: ${formatNumero(saldoToras, 2, 3)} m³ (equivalente). Usado no rendimento.`}
              />
            </div>
          </Secao>

          <Secao
            titulo="Peças produzidas"
            descricao="Uma linha por medida e qualidade. Ex.: 1,8 × 9 × 1,20 m."
          >
            <TabelaPecas qualidades={qualidades} bitolas={bitolas} />
          </Secao>

          <Secao titulo="Observações">
            <CampoTextoLongo name="observacoes" label="Observações" rows={2} />
          </Secao>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="from-primary text-primary-foreground hidden flex-col gap-4 rounded-2xl bg-gradient-to-br to-[#5a2f12] p-6 shadow-xl lg:flex">
            <span className="text-primary-foreground/70 text-sm">Madeira serrada</span>
            <motion.span
              key={`vol-${calc.volumeSerradoM3}`}
              initial={{ scale: 0.92, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              className="font-heading text-4xl font-semibold tabular-nums"
            >
              {formatNumero(calc.volumeSerradoM3, 3, 6)} <span className="text-xl">m³</span>
            </motion.span>
            <span className="text-primary-foreground/80 text-sm">
              {calc.totalPecas.toLocaleString("pt-BR")} peças
            </span>
            <div className="h-px bg-white/20" />
            <span className="text-primary-foreground/70 text-sm">Rendimento da serraria</span>
            <span className="font-heading text-4xl font-semibold tabular-nums">
              {calc.rendimento === null ? "—" : formatPercentual(calc.rendimento)}
            </span>
            <span className="text-primary-foreground/70 text-xs">
              m³ serrado ÷ m³ de tora consumida
            </span>
            <Button
              type="submit"
              size="lg"
              variant="secondary"
              disabled={pendente}
              className="mt-2 h-14 text-base"
            >
              {pendente ? <Loader2 className="animate-spin" /> : <Save />} Lançar produção
            </Button>
          </div>
          <div className="bg-background/95 fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t p-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
            <div className="min-w-0 flex-1">
              <div className="text-xl font-semibold tabular-nums">
                {formatNumero(calc.volumeSerradoM3, 3, 6)} m³
              </div>
              <div className={cn("text-xs", corRendimento(calc.rendimento))}>
                {calc.totalPecas} peças · rendimento{" "}
                {calc.rendimento === null ? "—" : formatPercentual(calc.rendimento)}
              </div>
            </div>
            <Button type="submit" size="lg" disabled={pendente} className="h-14 px-6 text-base">
              {pendente ? <Loader2 className="animate-spin" /> : <Save />} Lançar
            </Button>
          </div>
        </aside>
      </form>
    </FormProvider>
  )
}
