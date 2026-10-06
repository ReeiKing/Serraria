"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Ban, CheckCircle2, Loader2, Save, Trash2 } from "lucide-react"
import { useTransition, type ReactNode } from "react"
import {
  FormProvider,
  useForm,
  type FieldValues,
  type Resolver,
  type UseFormReturn,
} from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import type { Resultado } from "@/lib/acoes"

type Props<S extends z.ZodType<unknown, FieldValues>> = {
  schema: S
  valoresIniciais: z.input<S>
  salvar: (valores: z.input<S>) => Promise<Resultado<unknown>>
  excluir?: () => Promise<Resultado<unknown>>
  /** Para cadastros com ativo/inativo */
  ativo?: { valor: boolean; alternar: () => Promise<Resultado<unknown>> }
  aoConcluir?: () => void
  mensagemSucesso?: string
  rotuloSalvar?: string
  children: ReactNode | ((form: UseFormReturn<z.input<S>>) => ReactNode)
}

export function FormularioCadastro<S extends z.ZodType<unknown, FieldValues>>({
  schema,
  valoresIniciais,
  salvar,
  excluir,
  ativo,
  aoConcluir,
  mensagemSucesso = "Salvo com sucesso.",
  rotuloSalvar = "Salvar",
  children,
}: Props<S>) {
  const [pendente, iniciar] = useTransition()
  const form = useForm<z.input<S>>({
    resolver: zodResolver(schema as never) as unknown as Resolver<z.input<S>>,
    defaultValues: valoresIniciais as never,
    mode: "onTouched",
  })

  const executar = (fn: () => Promise<Resultado<unknown>>, sucesso: string) =>
    iniciar(async () => {
      const r = await fn()
      if (r.ok) {
        toast.success(sucesso)
        aoConcluir?.()
      } else {
        toast.error(r.erro)
      }
    })

  const onSubmit = form.handleSubmit((valores) => executar(() => salvar(valores), mensagemSucesso))

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        <FieldGroup>{typeof children === "function" ? children(form) : children}</FieldGroup>

        <div className="bg-background/95 sticky bottom-0 -mx-4 flex flex-wrap gap-2 border-t px-4 pt-4 backdrop-blur">
          <Button type="submit" size="lg" disabled={pendente} className="min-w-32">
            {pendente ? <Loader2 className="animate-spin" /> : <Save />}
            {rotuloSalvar}
          </Button>
          {ativo && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={pendente}
              onClick={() => executar(ativo.alternar, ativo.valor ? "Desativado." : "Reativado.")}
            >
              {ativo.valor ? <Ban /> : <CheckCircle2 />}
              {ativo.valor ? "Desativar" : "Reativar"}
            </Button>
          )}
          {excluir && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  disabled={pendente}
                  className="text-destructive hover:text-destructive ml-auto"
                >
                  <Trash2 />
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir este registro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Se o registro já foi usado em lançamentos,
                    prefira desativá-lo.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={() => executar(excluir, "Excluído.")}
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </form>
    </FormProvider>
  )
}
