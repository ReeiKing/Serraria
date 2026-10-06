"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle2, Loader2, Plus, Save, Trash2, TriangleAlert } from "lucide-react"
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

import { CampoBusca, CampoNumero, CampoTexto, CampoTextoLongo } from "@/components/form/campos"
import { CamposEndereco } from "@/components/form/campos-endereco"
import { EscolhaCartoes, Secao } from "@/components/sistema/escolha-cartoes"
import {
  SeletorItemEstoque,
  type OpcaoItemEstoque,
} from "@/components/sistema/seletor-item-estoque"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { formatM3, formatMoeda, formatNumero, numeroParaCampo, parseNumeroBR } from "@/lib/format"
import { vendaSchema } from "@/lib/schemas/vendas"
import { calcularVenda } from "@/lib/vendas"

import { salvarVenda } from "./actions"

export type ValoresVenda = z.input<typeof vendaSchema>

export type OpcaoCliente = {
  valor: string
  rotulo: string
  detalhe?: string
  endereco: {
    cep: string | null
    logradouro: string | null
    numero: string | null
    complemento: string | null
    bairro: string | null
    municipio: string | null
    codigoIbge: string | null
    uf: string | null
  }
}

type OpcaoVeiculo = { id: string; rotulo: string; tipo: string; motoristaPadraoId: string | null }

const ITEM_VAZIO = { estoqueItemId: "", quantidade: "", precoM3: "" }
const useForm2 = () => useFormContext<ValoresVenda>()

function TabelaItens({ itensEstoque }: { itensEstoque: OpcaoItemEstoque[] }) {
  const form = useForm2()
  const { fields, append, remove } = useFieldArray<ValoresVenda, "itens">({ name: "itens" })
  const itens = useWatch<ValoresVenda, "itens">({ name: "itens" })
  const porId = new Map(itensEstoque.map((i) => [i.id, i]))
  const calc = calcularVenda(
    (itens ?? []).map((i) => {
      const e = porId.get(i.estoqueItemId)
      return {
        espessuraCm: e?.espessuraCm ?? 0,
        larguraCm: e?.larguraCm ?? 0,
        comprimentoM: e?.comprimentoM ?? 0,
        quantidade: i.quantidade,
        precoM3: i.precoM3,
      }
    })
  )
  const erros = form.formState.errors.itens

  return (
    <div className="flex flex-col gap-3">
      <div className="text-muted-foreground hidden grid-cols-[2.4fr_0.8fr_1fr_1fr_auto] gap-2 px-1 text-xs font-medium md:grid">
        <span>Bitola do estoque</span>
        <span>Peças</span>
        <span>R$/m³</span>
        <span className="text-right">m³ · valor</span>
        <span className="w-10" />
      </div>
      <AnimatePresence initial={false}>
        {fields.map((f, i) => {
          const sel = porId.get(itens?.[i]?.estoqueItemId ?? "")
          const qtd = Number(itens?.[i]?.quantidade || 0)
          const falta = sel && qtd > sel.saldoPecas
          const e = erros?.[i]
          return (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-muted/30 grid grid-cols-2 items-start gap-2 rounded-xl border p-2 md:grid-cols-[2.4fr_0.8fr_1fr_1fr_auto] md:border-0 md:bg-transparent md:p-0"
            >
              <div className="col-span-2 md:col-span-1">
                <SeletorItemEstoque
                  itens={itensEstoque}
                  valor={itens?.[i]?.estoqueItemId ?? ""}
                  invalido={!!e?.estoqueItemId}
                  rotuloAcessivel={`Bitola da linha ${i + 1}`}
                  aoMudar={(id) => {
                    form.setValue(`itens.${i}.estoqueItemId`, id, { shouldValidate: true })
                    const item = porId.get(id)
                    if (item?.precoM3)
                      form.setValue(`itens.${i}.precoM3`, numeroParaCampo(item.precoM3), {
                        shouldValidate: true,
                      })
                  }}
                />
              </div>
              <div>
                <span className="text-muted-foreground mb-1 block text-xs md:hidden">Peças</span>
                <Input
                  inputMode="numeric"
                  placeholder="0"
                  aria-label={`Peças da linha ${i + 1}`}
                  aria-invalid={!!e?.quantidade || !!falta}
                  className="h-11 text-base tabular-nums"
                  {...form.register(`itens.${i}.quantidade`, {
                    onChange: (ev) => (ev.target.value = ev.target.value.replace(/\D/g, "")),
                  })}
                />
              </div>
              <div>
                <span className="text-muted-foreground mb-1 block text-xs md:hidden">R$/m³</span>
                <Input
                  inputMode="decimal"
                  placeholder="0,00"
                  aria-label={`Preço por m³ da linha ${i + 1}`}
                  aria-invalid={!!e?.precoM3}
                  className="h-11 text-base tabular-nums"
                  {...form.register(`itens.${i}.precoM3`, {
                    onChange: (ev) => (ev.target.value = ev.target.value.replace(/[^\d.,]/g, "")),
                  })}
                />
              </div>
              <div className="flex h-11 flex-col justify-center text-sm tabular-nums md:items-end">
                <span className="font-semibold">{formatMoeda(calc.linhas[i]?.valor ?? 0)}</span>
                <span className="text-muted-foreground text-xs">
                  {formatM3(calc.linhas[i]?.volumeM3 ?? 0)} m³
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
              {(falta || e) && (
                <p className="text-destructive col-span-full flex items-center gap-1 text-sm">
                  {falta && !e ? (
                    <>
                      <TriangleAlert className="size-4" /> Só há{" "}
                      {sel!.saldoPecas.toLocaleString("pt-BR")} peças em estoque.
                    </>
                  ) : (
                    (e?.estoqueItemId?.message ?? e?.quantidade?.message ?? e?.precoM3?.message)
                  )}
                </p>
              )}
            </motion.div>
          )
        })}
      </AnimatePresence>
      {erros?.message && <FieldError>{erros.message}</FieldError>}
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="h-12 self-start"
        onClick={() => append({ ...ITEM_VAZIO })}
      >
        <Plus /> Adicionar item
      </Button>
    </div>
  )
}

export function FormularioVenda({
  id,
  valoresIniciais,
  clientes,
  motoristas,
  veiculos,
  itensEstoque,
}: {
  id: string | null
  valoresIniciais: ValoresVenda
  clientes: OpcaoCliente[]
  motoristas: { valor: string; rotulo: string }[]
  veiculos: OpcaoVeiculo[]
  itensEstoque: OpcaoItemEstoque[]
}) {
  const router = useRouter()
  const [pendente, iniciar] = useTransition()
  const form = useForm<ValoresVenda>({
    resolver: zodResolver(vendaSchema) as unknown as Resolver<ValoresVenda>,
    defaultValues: valoresIniciais,
    mode: "onTouched",
  })
  const v = useWatch({ control: form.control }) as ValoresVenda
  const porId = new Map(itensEstoque.map((i) => [i.id, i]))
  const frete = v.tipoFrete === "sem_frete" ? 0 : (parseNumeroBR(v.valorFrete) ?? 0)
  const desconto = parseNumeroBR(v.desconto) ?? 0
  const calc = calcularVenda(
    (v.itens ?? []).map((i) => {
      const e = porId.get(i.estoqueItemId)
      return {
        espessuraCm: e?.espessuraCm ?? 0,
        larguraCm: e?.larguraCm ?? 0,
        comprimentoM: e?.comprimentoM ?? 0,
        quantidade: i.quantidade,
        precoM3: i.precoM3,
      }
    }),
    frete,
    desconto
  )

  function aoEscolherCliente(clienteId: string) {
    const c = clientes.find((x) => x.valor === clienteId)
    if (!c) return
    const e = c.endereco
    const mapa = {
      destinoCep: e.cep,
      destinoLogradouro: e.logradouro,
      destinoNumero: e.numero,
      destinoComplemento: e.complemento,
      destinoBairro: e.bairro,
      destinoMunicipio: e.municipio,
      destinoCodigoIbge: e.codigoIbge,
      destinoUf: e.uf,
    } as const
    for (const [campo, valor] of Object.entries(mapa))
      form.setValue(campo as keyof typeof mapa, valor ?? "", { shouldDirty: true })
  }

  function aoEscolherVeiculo(veiculoId: string) {
    const ve = veiculos.find((x) => x.id === veiculoId)
    if (!ve) return
    form.setValue("placa", ve.rotulo)
    if (ve.motoristaPadraoId && !form.getValues("motoristaId"))
      form.setValue("motoristaId", ve.motoristaPadraoId)
  }

  function enviar(confirmar: boolean, permitirNegativo = false) {
    iniciar(async () => {
      const valores = form.getValues()
      if (valores.tipoFrete === "sem_frete") valores.valorFrete = ""
      const r = await salvarVenda(id, valores, { confirmar, permitirNegativo })
      if (r.ok) {
        toast.success(
          confirmar
            ? `Venda confirmada! Romaneio nº ${r.dados.romaneio} gerado.`
            : "Rascunho salvo."
        )
        router.push(`/sistema/vendas/${r.dados.id}`)
        router.refresh()
      } else if (r.codigo === "ESTOQUE_NEGATIVO") {
        if (
          window.confirm(
            `${r.erro}.\n\nConfirmar a venda mesmo assim, deixando o estoque negativo?`
          )
        )
          enviar(confirmar, true)
      } else toast.error(r.erro)
    })
  }

  const salvar = (confirmar: boolean) =>
    form.handleSubmit(
      () => enviar(confirmar),
      () => toast.error("Confira os campos destacados.")
    )

  return (
    <FormProvider {...form}>
      <form
        onSubmit={salvar(true)}
        noValidate
        className="grid gap-6 pb-32 lg:grid-cols-[1fr_340px] lg:pb-0"
      >
        <div className="flex flex-col gap-6">
          <Secao
            titulo="Cliente e destino"
            descricao="O destino vem do cadastro do cliente e pode ser alterado só para esta carga."
          >
            <CampoBusca
              name="clienteId"
              label="Cliente"
              opcoes={clientes}
              placeholder="Selecione o cliente"
              aoMudar={aoEscolherCliente}
              vazio="Nenhum cliente. Cadastre em Cadastros → Clientes."
            />
            <CamposEndereco
              comIbge
              nomes={{
                cep: "destinoCep",
                logradouro: "destinoLogradouro",
                numero: "destinoNumero",
                complemento: "destinoComplemento",
                bairro: "destinoBairro",
                municipio: "destinoMunicipio",
                uf: "destinoUf",
                codigoIbge: "destinoCodigoIbge",
              }}
            />
          </Secao>

          <Secao titulo="Itens da carga">
            <TabelaItens itensEstoque={itensEstoque} />
          </Secao>

          <Secao titulo="Transporte e frete">
            <div className="grid gap-4 sm:grid-cols-3">
              <CampoBusca
                name="veiculoId"
                label="Veículo"
                opcoes={veiculos.map((x) => ({ valor: x.id, rotulo: x.rotulo, detalhe: x.tipo }))}
                placeholder="Placa cadastrada"
                permitirVazio
                aoMudar={aoEscolherVeiculo}
              />
              <CampoTexto
                name="placa"
                label="Placa"
                placeholder="ABC1D23"
                inputClassName="uppercase"
              />
              <CampoBusca
                name="motoristaId"
                label="Motorista"
                opcoes={motoristas}
                placeholder="Selecione"
                permitirVazio
              />
            </div>
            <EscolhaCartoes
              nome="frete"
              colunas={3}
              valor={v.tipoFrete}
              opcoes={[
                { valor: "cif", rotulo: "CIF", descricao: "Frete por nossa conta" },
                { valor: "fob", rotulo: "FOB", descricao: "Por conta do cliente" },
                { valor: "sem_frete", rotulo: "Sem frete", descricao: "Cliente retira" },
              ]}
              aoMudar={(f) => form.setValue("tipoFrete", f)}
            />
            <div className="grid gap-4 sm:grid-cols-3">
              {v.tipoFrete !== "sem_frete" && (
                <CampoNumero
                  name="valorFrete"
                  label="Valor do frete"
                  sufixo="R$"
                  placeholder="0,00"
                />
              )}
              <CampoNumero name="desconto" label="Desconto" sufixo="R$" placeholder="0,00" />
              <CampoTexto
                name="documentoFlorestal"
                label="Doc. florestal / obs. ambiental"
                descricao="Opcional (pinus/eucalipto plantado normalmente dispensa DOF)."
              />
            </div>
          </Secao>

          <Secao titulo="Observações">
            <CampoTextoLongo name="observacoes" label="Observações (saem no romaneio)" rows={2} />
          </Secao>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="from-primary text-primary-foreground hidden flex-col gap-3 rounded-2xl bg-gradient-to-br to-[#5a2f12] p-6 shadow-xl lg:flex">
            <span className="text-primary-foreground/70 text-sm">Carga</span>
            <span className="font-heading text-3xl font-semibold tabular-nums">
              {formatNumero(calc.totalM3, 3, 6)} m³
            </span>
            <span className="text-primary-foreground/80 text-sm">
              {calc.totalPecas.toLocaleString("pt-BR")} peças
            </span>
            <div className="h-px bg-white/20" />
            <dl className="grid grid-cols-2 gap-1 text-sm tabular-nums">
              <dt className="text-primary-foreground/70">Produtos</dt>
              <dd className="text-right">{formatMoeda(calc.valorProdutos)}</dd>
              <dt className="text-primary-foreground/70">Frete</dt>
              <dd className="text-right">{formatMoeda(frete)}</dd>
              <dt className="text-primary-foreground/70">Desconto</dt>
              <dd className="text-right">− {formatMoeda(desconto)}</dd>
            </dl>
            <span className="text-primary-foreground/70 text-sm">Total da venda</span>
            <motion.span
              key={`t-${calc.valorTotal}`}
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
              {pendente ? <Loader2 className="animate-spin" /> : <CheckCircle2 />} Salvar e
              confirmar
            </Button>
            <Button
              type="button"
              size="lg"
              variant="ghost"
              disabled={pendente}
              onClick={salvar(false)}
              className="text-primary-foreground hover:text-primary-foreground hover:bg-white/10"
            >
              <Save /> Salvar rascunho
            </Button>
            <span className="text-primary-foreground/60 text-xs">
              Confirmar baixa o estoque e gera o romaneio. Rascunho não mexe no estoque.
            </span>
          </div>
          <div className="bg-background/95 fixed inset-x-0 bottom-0 z-40 flex items-center gap-2 border-t p-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
            <div className="min-w-0 flex-1">
              <div className="text-muted-foreground truncate text-xs">
                {formatNumero(calc.totalM3, 3, 6)} m³ · {calc.totalPecas} pç
              </div>
              <div className="truncate text-lg font-semibold tabular-nums">
                {formatMoeda(calc.valorTotal)}
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-14"
              disabled={pendente}
              onClick={salvar(false)}
              aria-label="Salvar rascunho"
            >
              <Save />
            </Button>
            <Button type="submit" size="lg" disabled={pendente} className="h-14 px-5">
              {pendente ? <Loader2 className="animate-spin" /> : <CheckCircle2 />} Confirmar
            </Button>
          </div>
        </aside>
      </form>
    </FormProvider>
  )
}
