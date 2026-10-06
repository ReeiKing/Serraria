"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { motion, useAnimationControls, useReducedMotion } from "framer-motion"
import { ArrowLeft, Eye, EyeOff, Loader2, Lock, LogIn, Mail } from "lucide-react"
import Link from "next/link"
import { useActionState, useEffect, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Marca } from "@/components/marca"
import { BotaoAnimado } from "@/components/site/botao-animado"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { entrar, type LoginEstado } from "./actions"

const schema = z.object({
  email: z.string().trim().pipe(z.email("Informe um e-mail válido")),
  senha: z.string().min(6, "A senha tem pelo menos 6 caracteres"),
})

const cascata = { o: {}, v: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }
const item = {
  o: { opacity: 0, y: 18 },
  v: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
}

export function LoginForm({ proximo }: { proximo?: string }) {
  const reduzir = useReducedMotion()
  const tremor = useAnimationControls()
  const [estado, acao] = useActionState<LoginEstado, FormData>(entrar, {})
  const [enviando, iniciar] = useTransition()
  const [verSenha, setVerSenha] = useState(false)
  const form = useForm<z.input<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", senha: "" },
  })

  // Erro de login: o cartão "treme" para chamar a atenção.
  useEffect(() => {
    if (estado.erro && !reduzir)
      void tremor.start({ x: [0, -12, 12, -8, 8, -4, 0], transition: { duration: 0.5 } })
  }, [estado, tremor, reduzir])

  const onSubmit = form.handleSubmit((dados) => {
    const fd = new FormData()
    fd.set("email", dados.email)
    fd.set("senha", dados.senha)
    if (proximo) fd.set("proximo", proximo)
    iniciar(() => acao(fd))
  })

  const { errors } = form.formState

  return (
    <motion.div animate={tremor} className="w-full max-w-md">
      <motion.div
        variants={cascata}
        initial={reduzir ? false : "o"}
        animate="v"
        className="flex flex-col gap-8"
      >
        <motion.div variants={item} className="flex items-center justify-between">
          <Link
            href="/"
            className="group text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            Voltar ao site
          </Link>
        </motion.div>

        <motion.div variants={item}>
          <motion.span
            className="mb-5 hidden lg:inline-flex"
            whileHover={reduzir ? undefined : { rotate: 360, scale: 1.05 }}
            transition={{ duration: 0.8 }}
          >
            <Marca className="size-14 rounded-2xl" />
          </motion.span>
          <h1 className="font-heading text-3xl font-semibold md:text-4xl">Acesse o sistema</h1>
          <p className="text-muted-foreground mt-2">
            Entre para lançar cargas, produção, vendas e notas.
          </p>
        </motion.div>

        <form onSubmit={onSubmit} noValidate>
          <FieldGroup>
            <motion.div variants={item}>
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email">E-mail</FieldLabel>
                <div className="group relative">
                  <Mail className="text-muted-foreground group-focus-within:text-primary pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="voce@serraria.com.br"
                    className="focus-visible:shadow-primary/10 h-12 pl-11 text-base transition-shadow focus-visible:shadow-lg"
                    aria-invalid={!!errors.email}
                    {...form.register("email")}
                  />
                </div>
                <FieldError errors={[errors.email]} />
              </Field>
            </motion.div>

            <motion.div variants={item}>
              <Field data-invalid={!!errors.senha}>
                <FieldLabel htmlFor="senha">Senha</FieldLabel>
                <div className="group relative">
                  <Lock className="text-muted-foreground group-focus-within:text-primary pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 transition-colors" />
                  <Input
                    id="senha"
                    type={verSenha ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="focus-visible:shadow-primary/10 h-12 pr-12 pl-11 text-base transition-shadow focus-visible:shadow-lg"
                    aria-invalid={!!errors.senha}
                    {...form.register("senha")}
                  />
                  <button
                    type="button"
                    onClick={() => setVerSenha((v) => !v)}
                    className="text-muted-foreground hover:bg-muted hover:text-foreground absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg"
                    aria-label={verSenha ? "Ocultar senha" : "Mostrar senha"}
                  >
                    <motion.span
                      key={String(verSenha)}
                      initial={{ rotateY: 90 }}
                      animate={{ rotateY: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {verSenha ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                    </motion.span>
                  </button>
                </div>
                <FieldError errors={[errors.senha]} />
              </Field>
            </motion.div>

            {estado.erro && (
              <motion.p
                role="alert"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="border-destructive/30 bg-destructive/10 text-destructive rounded-xl border px-4 py-3 text-sm"
              >
                {estado.erro}
              </motion.p>
            )}

            <motion.div variants={item}>
              <BotaoAnimado
                type="submit"
                disabled={enviando}
                seta={!enviando}
                icone={
                  enviando ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <LogIn className="size-5" />
                  )
                }
                className="h-13 w-full rounded-xl"
              >
                {enviando ? "Entrando…" : "Entrar no sistema"}
              </BotaoAnimado>
            </motion.div>
          </FieldGroup>
        </form>

        <motion.p variants={item} className="text-muted-foreground text-center text-sm">
          Esqueceu a senha? Peça para um usuário do sistema trocar em{" "}
          <span className="font-medium">Cadastros → Usuários</span>.
        </motion.p>
      </motion.div>
    </motion.div>
  )
}
