"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, LogIn } from "lucide-react"
import { useActionState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { entrar, type LoginEstado } from "./actions"

const schema = z.object({
  email: z.string().trim().email("Informe um e-mail válido"),
  senha: z.string().min(6, "A senha tem pelo menos 6 caracteres"),
})

export function LoginForm({ proximo }: { proximo?: string }) {
  const [estado, acao] = useActionState<LoginEstado, FormData>(entrar, {})
  const [enviando, iniciar] = useTransition()
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", senha: "" },
  })

  const onSubmit = form.handleSubmit((dados) => {
    const fd = new FormData()
    fd.set("email", dados.email)
    fd.set("senha", dados.senha)
    if (proximo) fd.set("proximo", proximo)
    iniciar(() => acao(fd))
  })

  const { errors } = form.formState

  return (
    <form onSubmit={onSubmit} noValidate>
      <FieldGroup>
        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            className="h-11"
            aria-invalid={!!errors.email}
            {...form.register("email")}
          />
          <FieldError errors={[errors.email]} />
        </Field>
        <Field data-invalid={!!errors.senha}>
          <FieldLabel htmlFor="senha">Senha</FieldLabel>
          <Input
            id="senha"
            type="password"
            autoComplete="current-password"
            className="h-11"
            aria-invalid={!!errors.senha}
            {...form.register("senha")}
          />
          <FieldError errors={[errors.senha]} />
        </Field>
        {estado.erro && (
          <p role="alert" className="text-destructive text-sm">
            {estado.erro}
          </p>
        )}
        <Button type="submit" size="lg" className="h-11 w-full" disabled={enviando}>
          {enviando ? <Loader2 className="animate-spin" /> : <LogIn />}
          Entrar
        </Button>
      </FieldGroup>
    </form>
  )
}
