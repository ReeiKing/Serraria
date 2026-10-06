"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { AnimatePresence, motion } from "framer-motion"
import { Box, Copy, Loader2, Plus, Save, Scale, Trash2, Weight } from "lucide-react"
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

import {
  CampoBusca,
  CampoNumero,
  CampoSelect,
  CampoTexto,
  CampoTextoLongo,
} from "@/components/form/campos"
import { EscolhaCartoes, Secao } from "@/components/sistema/escolha-cartoes"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { calcularEntrada } from "@/lib/entradas"
import { formatM3, formatMoeda, formatNumero, numeroParaCampo } from "@/lib/format"
import type { OpcoesCadastros } from "@/lib/consultas/opcoes"
import type { PrecoVigente } from "@/lib/precos"
import {
  MODOS_MEDICAO,
  SIGLA_UNIDADE,
  UNIDADE_DO_MODO,
  entradaToraSchema,
  type ModoMedicao,
} from "@/lib/schemas/entradas"
import { UFS } from "@/lib/uf"
import { cn } from "@/lib/utils"

import { salvarEntrada } from "./actions"

export type ValoresEntrada = z.input<typeof entradaToraSchema>

const ICONE_MODO: Record<ModoMedicao, React.ReactNode> = {
  m3: <Box className="size-6" />,
  estereo: <Scale className="size-6" />,
  tonelada: <Weight className="size-6" />,
}

const useFormContextTyped = () => useFormContext<ValoresEntrada>()

export const TORA_VAZIA = { diametroCm: "", comprimentoM: "", quantidade: "1" }

function TabelaToras() {
  const { fields, append, remove } = useFieldArray<ValoresEntrada, "toras">({ name: "toras" })
  const toras = useWatch<ValoresEntrada, "toras">({ name: "toras" })
  const form = useFormContextTyped()
  const erroRaiz =
    form.formState.errors.toras?.root?.message ?? form.formState.errors.toras?.message

  return (
    <div className="flex flex-col gap-3">
      <div className="text-muted-foreground hidden grid-cols-[1fr_1fr_0.8fr_1fr_auto] gap-2 px-1 text-xs font-medium sm:grid">
        <span>Diâmetro (cm)</span>
        <span>Comprimento (m)</span>
        <span>Qtd. toras</span>
        <span className="text-right">Volume</span>
        <span className="w-10" />
      </div>
      <AnimatePresence initial={false}>
        {fields.map((f, i) => {
          const linha = toras?.[i]
          const vol = linha ? calcularEntrada({ modoMedicao: "m3", toras: [linha] }).quantidade : 0
          const erros = form.formState.errors.toras?.[i]
          return (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-muted/30 grid grid-cols-3 items-start gap-2 rounded-xl border p-2 sm:grid-cols-[1fr_1fr_0.8fr_1fr_auto] sm:border-0 sm:bg-transparent sm:p-0"
            >
              {(["diametroCm", "comprimentoM", "quantidade"] as const).map((campo) => (
                <div key={campo}>
                  <span className="text-muted-foreground mb-1 block text-xs sm:hidden">
                    {campo === "diametroCm"
                      ? "Diâm. (cm)"
                      : campo === "comprimentoM"
                        ? "Compr. (m)"
                        : "Qtd."}
                  </span>
                  <Input
                    inputMode="decimal"
                    autoComplete="off"
                    aria-label={`${campo} da linha ${i + 1}`}
                    aria-invalid={!!erros?.[campo]}
                    className="h-11 text-base tabular-nums"
                    {...form.register(`toras.${i}.${campo}`, {
                      onChange: (e) => (e.target.value = e.target.value.replace(/[^\d.,]/g, "")),
                    })}
                  />
                </div>
              ))}
              <div className="col-span-2 flex h-11 items-center text-sm tabular-nums sm:col-span-1 sm:justify-end">
                <span className="text-muted-foreground sm:hidden">Volume:&nbsp;</span>
                <span className="font-semibold">{formatM3(vol)} m³</span>
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
              {erros && (
                <p className="text-destructive col-span-full text-sm">
                  {erros.diametroCm?.message ??
                    erros.comprimentoM?.message ??
                    erros.quantidade?.message}
                </p>
              )}
            </motion.div>
          )
        })}
      </AnimatePresence>
      {erroRaiz && <FieldError>{erroRaiz}</FieldError>}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-12"
          onClick={() => append({ ...TORA_VAZIA })}
        >
          <Plus /> Adicionar tora
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="h-12"
          onClick={() => {
            const ultima = toras?.[toras.length - 1]
            append(ultima ? { ...ultima } : { ...TORA_VAZIA })
          }}
        >
          <Copy /> Repetir última
        </Button>
      </div>
      <p className="text-muted-foreground text-xs">
        Volume de cada tora = π × (D/2)² × comprimento. Use &quot;Qtd. toras&quot; para lançar
        várias toras com o mesmo diâmetro.
      </p>
    </div>
  )
}

export function FormularioEntrada({
  id,
  valoresIniciais,
  opcoes,
  precos,
}: {
  id: string | null
  valoresIniciais: ValoresEntrada
  opcoes: OpcoesCadastros
  precos: PrecoVigente[]
}) {
  const router = useRouter()
  const [pendente, iniciar] = useTransition()
  const precoTabela = (especieId: string, modoMedicao: ModoMedicao) =>
    precos.find(
      (p) =>
        p.tipo === "compra_tora" &&
        p.especieId === especieId &&
        p.unidade === UNIDADE_DO_MODO[modoMedicao]
    )
  const form = useForm<ValoresEntrada>({
    resolver: zodResolver(entradaToraSchema) as unknown as Resolver<ValoresEntrada>,
    // entrada nova já começa com o preço vigente da tabela
    defaultValues: {
      ...valoresIniciais,
      valorUnitario:
        valoresIniciais.valorUnitario ||
        numeroParaCampo(precoTabela(valoresIniciais.especieId, valoresIniciais.modoMedicao)?.valor),
    },
    mode: "onTouched",
  })
  const valores = useWatch({ control: form.control }) as ValoresEntrada
  const calc = calcularEntrada(valores)
  const modo = valores.modoMedicao
  const unidade = UNIDADE_DO_MODO[modo]

  const sugestao = precoTabela(valores.especieId, modo)

  /**
   * Ao trocar espécie/modo, aplica o preço da tabela — mas só se o campo ainda tiver o
   * preço sugerido anterior (ou estiver vazio). Preço digitado à mão é mantido.
   */
  function aplicarPreco(especieId: string, modoMedicao: ModoMedicao, forcar = false) {
    const atual = form.getValues("valorUnitario")
    const anterior = numeroParaCampo(precoTabela(valores.especieId, valores.modoMedicao)?.valor)
    const manual = atual !== "" && atual !== anterior
    if (forcar || !manual) {
      const novo = precoTabela(especieId, modoMedicao)
      form.setValue("valorUnitario", novo ? numeroParaCampo(novo.valor) : "", {
        shouldValidate: !!novo,
      })
    }
  }

  function aoEscolherVeiculo(veiculoId: string) {
    const v = opcoes.veiculos.find((x) => x.id === veiculoId)
    if (!v) return
    form.setValue("placa", v.rotulo)
    if (v.motoristaPadraoId && !form.getValues("motoristaId"))
      form.setValue("motoristaId", v.motoristaPadraoId)
    if (v.taraKg && !form.getValues("taraKg")) form.setValue("taraKg", numeroParaCampo(v.taraKg))
  }

  const onSubmit = form.handleSubmit(
    () =>
      iniciar(async () => {
        const r = await salvarEntrada(id, form.getValues())
        if (r.ok) {
          toast.success(
            id ? "Entrada atualizada." : "Entrada registrada! Data e hora gravadas automaticamente."
          )
          router.push(`/sistema/entradas/${r.dados.id}`)
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
        className="grid gap-6 pb-28 lg:grid-cols-[1fr_340px] lg:pb-0"
      >
        <div className="flex flex-col gap-6">
          <Secao titulo="Madeira">
            <EscolhaCartoes
              nome="especie"
              valor={valores.especieId}
              opcoes={opcoes.especies.map((e) => ({ valor: e.id, rotulo: e.nome }))}
              aoMudar={(v) => {
                form.setValue("especieId", v, { shouldValidate: true })
                aplicarPreco(v, modo)
              }}
            />
            {form.formState.errors.especieId && (
              <FieldError>{form.formState.errors.especieId.message}</FieldError>
            )}
          </Secao>

          <Secao titulo="Fornecedor e transporte">
            <CampoBusca
              name="fornecedorId"
              label="Fornecedor"
              opcoes={opcoes.fornecedores}
              placeholder="Selecione o fornecedor"
              vazio="Nenhum fornecedor. Cadastre em Cadastros → Fornecedores."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <CampoBusca
                name="veiculoId"
                label="Veículo"
                opcoes={opcoes.veiculos.map((v) => ({
                  valor: v.id,
                  rotulo: v.rotulo,
                  detalhe: v.tipo,
                }))}
                placeholder="Placa cadastrada"
                permitirVazio
                aoMudar={aoEscolherVeiculo}
              />
              <CampoTexto
                name="placa"
                label="Placa"
                placeholder="ABC1D23"
                inputClassName="uppercase"
                descricao="Preenchida pelo veículo ou digite."
              />
              <CampoBusca
                name="motoristaId"
                label="Motorista"
                opcoes={opcoes.motoristas}
                placeholder="Selecione"
                permitirVazio
              />
              <CampoTexto name="documentoFlorestal" label="Documento florestal (opcional)" />
              <CampoTexto
                name="origem"
                label="Origem (propriedade)"
                placeholder="Fazenda, talhão…"
              />
              <div className="grid grid-cols-[1fr_88px] gap-2">
                <CampoTexto name="municipioOrigem" label="Município" />
                <CampoSelect
                  name="ufOrigem"
                  label="UF"
                  opcoes={UFS.map((u) => ({ valor: u, rotulo: u }))}
                  placeholder="UF"
                />
              </div>
            </div>
          </Secao>

          <Secao titulo="Medição" descricao="Escolha como esta carga é comprada.">
            <EscolhaCartoes
              nome="modo"
              colunas={3}
              valor={modo}
              opcoes={MODOS_MEDICAO.map((m) => ({
                valor: m.valor,
                rotulo: `${m.rotulo} (${m.sigla})`,
                descricao: m.descricao,
                icone: ICONE_MODO[m.valor],
              }))}
              aoMudar={(v) => {
                form.setValue("modoMedicao", v)
                form.clearErrors()
                aplicarPreco(valores.especieId, v)
              }}
            />
            <AnimatePresence mode="wait">
              <motion.div
                key={modo}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {modo === "estereo" && (
                  <div className="grid gap-4 sm:grid-cols-3">
                    <CampoNumero
                      name="cargaComprimentoM"
                      label="Comprimento da carga"
                      sufixo="m"
                      placeholder="7,20"
                    />
                    <CampoNumero
                      name="cargaLarguraM"
                      label="Largura"
                      sufixo="m"
                      placeholder="2,50"
                    />
                    <CampoNumero name="cargaAlturaM" label="Altura" sufixo="m" placeholder="2,80" />
                  </div>
                )}
                {modo === "tonelada" && (
                  <div className="grid gap-4 sm:grid-cols-3">
                    <CampoNumero
                      name="pesoBrutoKg"
                      label="Peso bruto (balança)"
                      sufixo="kg"
                      placeholder="45.300"
                    />
                    <CampoNumero
                      name="taraKg"
                      label="Tara do veículo"
                      sufixo="kg"
                      placeholder="15.250"
                      descricao="Vem do cadastro do veículo."
                    />
                    <div className="bg-muted/60 flex flex-col justify-center rounded-xl px-4 py-2">
                      <span className="text-muted-foreground text-xs">Peso líquido</span>
                      <span className="text-xl font-semibold tabular-nums">
                        {formatNumero(calc.pesoLiquidoKg ?? 0, 0)} kg
                      </span>
                    </div>
                  </div>
                )}
                {modo === "m3" && <TabelaToras />}
              </motion.div>
            </AnimatePresence>
          </Secao>

          <Secao titulo="Valor e observações">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <CampoNumero
                  name="valorUnitario"
                  label={`Valor por ${SIGLA_UNIDADE[unidade]}`}
                  sufixo="R$"
                  placeholder="0,00"
                />
                {sugestao ? (
                  <button
                    type="button"
                    onClick={() => aplicarPreco(valores.especieId, modo, true)}
                    className="bg-floresta/10 text-floresta hover:bg-floresta/20 self-start rounded-full px-3 py-1 text-xs font-medium"
                  >
                    Tabela: {formatMoeda(sugestao.valor)}/{SIGLA_UNIDADE[unidade]} — usar
                  </button>
                ) : (
                  <span className="text-muted-foreground text-xs">
                    Sem preço na tabela para esta espécie/unidade.
                  </span>
                )}
              </div>
            </div>
            <CampoTextoLongo name="observacoes" label="Observações" rows={3} />
          </Secao>
        </div>

        {/* Resumo: lateral no desktop, barra fixa no celular */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="from-primary text-primary-foreground hidden flex-col gap-4 rounded-2xl border bg-gradient-to-br to-[#5a2f12] p-6 shadow-xl lg:flex">
            <span className="text-primary-foreground/70 text-sm">Total da carga</span>
            <motion.span
              key={`q-${calc.quantidade}`}
              initial={{ scale: 0.9, opacity: 0.4 }}
              animate={{ scale: 1, opacity: 1 }}
              className="font-heading text-4xl font-semibold tabular-nums"
            >
              {formatNumero(calc.quantidade, 3, 6)}{" "}
              <span className="text-xl">{SIGLA_UNIDADE[unidade]}</span>
            </motion.span>
            {modo === "m3" && (
              <span className="text-primary-foreground/80 text-sm">{calc.totalToras} toras</span>
            )}
            {modo === "tonelada" && (
              <span className="text-primary-foreground/80 text-sm">
                {formatNumero(calc.pesoLiquidoKg ?? 0, 0)} kg líquidos
              </span>
            )}
            <div className="bg-primary-foreground/20 h-px" />
            <span className="text-primary-foreground/70 text-sm">Valor a pagar</span>
            <motion.span
              key={`v-${calc.valorTotal}`}
              initial={{ y: 6, opacity: 0.4 }}
              animate={{ y: 0, opacity: 1 }}
              className="font-heading text-4xl font-semibold tabular-nums"
            >
              {formatMoeda(calc.valorTotal)}
            </motion.span>
            <Button
              type="submit"
              size="lg"
              variant="secondary"
              disabled={pendente}
              className="mt-2 h-14 text-base"
            >
              {pendente ? <Loader2 className="animate-spin" /> : <Save />}
              {id ? "Salvar alterações" : "Registrar entrada"}
            </Button>
            <span className="text-primary-foreground/60 text-xs">
              A data e a hora são registradas automaticamente ao salvar.
            </span>
          </div>

          <div className="bg-background/95 fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t p-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
            <div className="min-w-0 flex-1">
              <div className="text-muted-foreground truncate text-xs">
                {formatNumero(calc.quantidade, 3, 6)} {SIGLA_UNIDADE[unidade]}
              </div>
              <div className="truncate text-xl font-semibold tabular-nums">
                {formatMoeda(calc.valorTotal)}
              </div>
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={pendente}
              className={cn("h-14 px-6 text-base")}
            >
              {pendente ? <Loader2 className="animate-spin" /> : <Save />}
              {id ? "Salvar" : "Registrar"}
            </Button>
          </div>
        </aside>
      </form>
    </FormProvider>
  )
}
