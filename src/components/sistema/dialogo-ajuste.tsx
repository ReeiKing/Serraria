"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { FormProvider, useForm, useWatch, type Resolver } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"

import { CampoNumero, CampoSelect, CampoTexto } from "@/components/form/campos"
import { EscolhaCartoes } from "@/components/sistema/escolha-cartoes"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FieldGroup } from "@/components/ui/field"
import { ajustarEstoque } from "@/app/(sistema)/sistema/estoque/actions"
import { formatM3 } from "@/lib/format"
import { volumePecasM3 } from "@/lib/calculos"
import { parseNumeroBR, numeroParaCampo } from "@/lib/format"
import { MOTIVOS_AJUSTE, ajusteSchema } from "@/lib/schemas/producao"

type Valores = z.input<typeof ajusteSchema>
type Opcao = { id: string; nome: string }

export type ItemParaAjuste = {
  especieId: string
  qualidadeId: string
  espessuraCm: string
  larguraCm: string
  comprimentoM: string
}

export function DialogoAjuste({
  aberto,
  aoFechar,
  item,
  especies,
  qualidades,
}: {
  aberto: boolean
  aoFechar: () => void
  item: ItemParaAjuste | null
  especies: Opcao[]
  qualidades: Opcao[]
}) {
  const router = useRouter()
  const [pendente, iniciar] = useTransition()
  const form = useForm<Valores>({
    resolver: zodResolver(ajusteSchema) as unknown as Resolver<Valores>,
    values: {
      especieId: item?.especieId ?? especies[0]?.id ?? "",
      qualidadeId: item?.qualidadeId ?? qualidades[0]?.id ?? "",
      espessuraCm: numeroParaCampo(item?.espessuraCm),
      larguraCm: numeroParaCampo(item?.larguraCm),
      comprimentoM: numeroParaCampo(item?.comprimentoM),
      sentido: "saida",
      quantidade: "",
      motivo: "inventario",
      observacao: "",
      permitirNegativo: false,
    },
  })
  const v = useWatch({ control: form.control }) as Valores
  const vol = volumePecasM3(
    parseNumeroBR(v.espessuraCm ?? "") ?? 0,
    parseNumeroBR(v.larguraCm ?? "") ?? 0,
    parseNumeroBR(v.comprimentoM ?? "") ?? 0,
    parseNumeroBR(v.quantidade ?? "") ?? 0
  )

  function enviar(permitirNegativo: boolean) {
    iniciar(async () => {
      const r = await ajustarEstoque({ ...form.getValues(), permitirNegativo })
      if (r.ok) {
        toast.success("Ajuste lançado no estoque.")
        aoFechar()
        router.refresh()
      } else if (r.codigo === "ESTOQUE_NEGATIVO") {
        if (window.confirm(`${r.erro}.\n\nConfirmar o ajuste mesmo assim?`)) enviar(true)
      } else toast.error(r.erro)
    })
  }

  return (
    <Dialog open={aberto} onOpenChange={(a) => !a && aoFechar()}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ajuste de estoque</DialogTitle>
          <DialogDescription>
            Entrada ou saída manual, com motivo. Fica registrado no histórico com data, hora e
            usuário.
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(() => enviar(false))} noValidate>
            <FieldGroup>
              <EscolhaCartoes
                nome="sentido"
                valor={v.sentido}
                opcoes={[
                  { valor: "entrada", rotulo: "Entrada (+)" },
                  { valor: "saida", rotulo: "Saída (−)" },
                ]}
                aoMudar={(s) => form.setValue("sentido", s)}
              />
              {!item && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <CampoSelect
                    name="especieId"
                    label="Espécie"
                    opcoes={especies.map((e) => ({ valor: e.id, rotulo: e.nome }))}
                  />
                  <CampoSelect
                    name="qualidadeId"
                    label="Qualidade"
                    opcoes={qualidades.map((q) => ({ valor: q.id, rotulo: q.nome }))}
                  />
                </div>
              )}
              <div className="grid grid-cols-3 gap-3">
                <CampoNumero name="espessuraCm" label="Esp. (cm)" disabled={!!item} />
                <CampoNumero name="larguraCm" label="Larg. (cm)" disabled={!!item} />
                <CampoNumero name="comprimentoM" label="Compr. (m)" disabled={!!item} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <CampoNumero
                  name="quantidade"
                  label="Quantidade de peças"
                  descricao={`= ${formatM3(vol)} m³`}
                  autoFocus
                />
                <CampoSelect name="motivo" label="Motivo" opcoes={[...MOTIVOS_AJUSTE]} />
              </div>
              <CampoTexto
                name="observacao"
                label="Observação"
                placeholder="Ex.: contagem do dia 06/10"
              />
              <Button type="submit" size="lg" disabled={pendente} className="h-12">
                {pendente ? <Loader2 className="animate-spin" /> : <Save />} Lançar ajuste
              </Button>
            </FieldGroup>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
