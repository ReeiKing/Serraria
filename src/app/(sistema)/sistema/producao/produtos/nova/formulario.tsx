"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Plus, Save, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { FormProvider, useFieldArray, useForm, useWatch, type Resolver } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"

import { CampoTexto, CampoTextoLongo } from "@/components/form/campos"
import { Secao } from "@/components/sistema/escolha-cartoes"
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
import { producaoProdutosSchema } from "@/lib/schemas/producao"

import { salvarProducaoProdutos } from "../../actions"

type Valores = z.input<typeof producaoProdutosSchema>
type Produto = { id: string; nome: string; dimensoes: string | null; saldo: number }

export function FormularioMontagem({ produtos, hoje }: { produtos: Produto[]; hoje: string }) {
  const router = useRouter()
  const [pendente, iniciar] = useTransition()
  const form = useForm<Valores>({
    resolver: zodResolver(producaoProdutosSchema) as unknown as Resolver<Valores>,
    defaultValues: {
      dataProducao: hoje,
      observacoes: "",
      itens: [{ produtoId: produtos[0]?.id ?? "", quantidade: "" }],
    },
  })
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "itens" })
  const itens = useWatch({ control: form.control, name: "itens" })
  const total = (itens ?? []).reduce((a, i) => a + (Number(i.quantidade) || 0), 0)
  const erros = form.formState.errors.itens

  const onSubmit = form.handleSubmit(
    () =>
      iniciar(async () => {
        const r = await salvarProducaoProdutos(form.getValues())
        if (r.ok) {
          toast.success("Montagem lançada! As unidades já estão no estoque.")
          router.push(`/sistema/producao/produtos/${r.dados.id}`)
          router.refresh()
        } else toast.error(r.erro)
      }),
    () => toast.error("Confira os campos destacados.")
  )

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        <Secao titulo="Montagem">
          <CampoTexto name="dataProducao" label="Data" type="date" className="max-w-xs" />
          <div className="flex flex-col gap-3">
            {fields.map((f, i) => {
              const e = erros?.[i]
              const prod = produtos.find((p) => p.id === itens?.[i]?.produtoId)
              return (
                <div key={f.id} className="grid grid-cols-[1fr_120px_auto] items-start gap-2">
                  <div>
                    <Select
                      value={itens?.[i]?.produtoId ?? ""}
                      onValueChange={(v) =>
                        form.setValue(`itens.${i}.produtoId`, v, { shouldValidate: true })
                      }
                    >
                      <SelectTrigger
                        className="h-12 w-full"
                        aria-label={`Produto da linha ${i + 1}`}
                        aria-invalid={!!e?.produtoId}
                      >
                        <SelectValue placeholder="Produto" />
                      </SelectTrigger>
                      <SelectContent>
                        {produtos.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.nome}
                            {p.dimensoes ? ` · ${p.dimensoes}` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {prod && (
                      <span className="text-muted-foreground text-xs">
                        Em estoque: {prod.saldo.toLocaleString("pt-BR")} un.
                      </span>
                    )}
                  </div>
                  <Input
                    inputMode="numeric"
                    placeholder="Unidades"
                    aria-label={`Unidades da linha ${i + 1}`}
                    aria-invalid={!!e?.quantidade}
                    className="h-12 text-base tabular-nums"
                    {...form.register(`itens.${i}.quantidade`, {
                      onChange: (ev) => (ev.target.value = ev.target.value.replace(/\D/g, "")),
                    })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-12"
                    onClick={() => remove(i)}
                    disabled={fields.length === 1}
                    aria-label={`Remover linha ${i + 1}`}
                  >
                    <Trash2 />
                  </Button>
                  {e && (
                    <p className="text-destructive col-span-full text-sm">
                      {e.produtoId?.message ?? e.quantidade?.message}
                    </p>
                  )}
                </div>
              )
            })}
            {erros?.message && <FieldError>{erros.message}</FieldError>}
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-12 self-start"
              onClick={() => append({ produtoId: produtos[0]?.id ?? "", quantidade: "" })}
            >
              <Plus /> Adicionar produto
            </Button>
          </div>
          <CampoTextoLongo name="observacoes" label="Observações" rows={2} />
        </Secao>
        <div className="from-primary text-primary-foreground flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-br to-[#5a2f12] p-5">
          <div>
            <div className="text-primary-foreground/70 text-sm">Total montado</div>
            <div className="font-heading text-3xl font-semibold tabular-nums">
              {total.toLocaleString("pt-BR")} un.
            </div>
          </div>
          <Button
            type="submit"
            size="lg"
            variant="secondary"
            disabled={pendente}
            className="h-14 text-base"
          >
            {pendente ? <Loader2 className="animate-spin" /> : <Save />} Lançar montagem
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
