"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { AnimatePresence, motion } from "framer-motion"
import {
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react"
import { useState, useTransition } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { enviarOrcamento } from "@/app/actions-site"
import { CampoSelect, CampoTexto, CampoTextoLongo } from "@/components/form/campos"
import { BotaoAnimado } from "@/components/site/botao-animado"
import { Revelar, TituloSecao } from "@/components/site/revelar"
import { FieldGroup } from "@/components/ui/field"
import { linkWhatsApp, siteConfig } from "@/config/site"

const schema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome"),
  telefone: z
    .string()
    .refine((v) => v.replace(/\D/g, "").length >= 10, "Informe um telefone com DDD"),
  email: z
    .string()
    .trim()
    .refine((v) => v === "" || z.email().safeParse(v).success, "E-mail inválido"),
  cidade: z.string(),
  produto: z.string(),
  mensagem: z.string().max(2000),
  site: z.string(),
})
type Dados = z.infer<typeof schema>

const PRODUTOS = [
  "Pinus serrado",
  "Eucalipto serrado",
  "Vigas e caibros",
  "Tábuas",
  "Medida sob encomenda",
  "Outro",
].map((p) => ({ valor: p, rotulo: p }))

export function Contato() {
  const [enviado, setEnviado] = useState(false)
  const [pendente, iniciar] = useTransition()
  const form = useForm<Dados>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: "",
      telefone: "",
      email: "",
      cidade: "",
      produto: "",
      mensagem: "",
      site: "",
    },
    mode: "onTouched",
  })

  const onSubmit = form.handleSubmit((dados) =>
    iniciar(async () => {
      const r = await enviarOrcamento(dados)
      if (r.ok) {
        setEnviado(true)
        form.reset()
      } else toast.error(r.erro)
    })
  )

  const { contato, endereco } = siteConfig

  return (
    <section id="contato" className="bg-background scroll-mt-20 py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <TituloSecao
          selo="Orçamento"
          titulo="Conte o que você precisa"
          descricao="Respondemos rapidinho, no horário comercial."
        />

        <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
          <Revelar className="flex flex-col gap-4">
            {[
              { icone: Phone, titulo: "Telefone", texto: contato.telefone },
              { icone: Mail, titulo: "E-mail", texto: contato.email },
              {
                icone: MapPin,
                titulo: "Endereço",
                texto: `${endereco.logradouro} · ${endereco.municipio}/${endereco.uf}`,
              },
              { icone: Clock, titulo: "Horário", texto: contato.horario },
            ].map(({ icone: Icone, titulo, texto }) => (
              <motion.div
                key={titulo}
                whileHover={{ x: 6 }}
                className="bg-card flex items-start gap-4 rounded-2xl border p-5"
              >
                <span className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl">
                  <Icone className="size-5" />
                </span>
                <div>
                  <div className="text-muted-foreground text-sm">{titulo}</div>
                  <div className="font-medium">{texto}</div>
                </div>
              </motion.div>
            ))}
            <BotaoAnimado
              href={linkWhatsApp()}
              externo
              variante="floresta"
              icone={<MessageCircle className="size-5" />}
              className="mt-2"
            >
              Chamar no WhatsApp
            </BotaoAnimado>
          </Revelar>

          <Revelar atraso={0.1}>
            <div className="bg-card relative overflow-hidden rounded-3xl border p-6 shadow-xl md:p-8">
              <AnimatePresence mode="wait">
                {enviado ? (
                  <motion.div
                    key="ok"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex min-h-96 flex-col items-center justify-center gap-4 text-center"
                  >
                    <motion.span
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 260, damping: 15 }}
                    >
                      <CheckCircle2 className="text-floresta size-20" />
                    </motion.span>
                    <h3 className="font-heading text-2xl font-semibold">Pedido recebido!</h3>
                    <p className="text-muted-foreground max-w-sm">
                      Em breve entraremos em contato pelo telefone informado.
                    </p>
                    <button
                      type="button"
                      onClick={() => setEnviado(false)}
                      className="text-primary text-sm font-semibold underline-offset-4 hover:underline"
                    >
                      Enviar outro pedido
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <FormProvider {...form}>
                      <form onSubmit={onSubmit} noValidate>
                        <FieldGroup>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <CampoTexto name="nome" label="Seu nome" autoComplete="name" />
                            <CampoTexto
                              name="telefone"
                              label="Telefone / WhatsApp"
                              inputMode="tel"
                              autoComplete="tel"
                            />
                            <CampoTexto
                              name="email"
                              label="E-mail (opcional)"
                              type="email"
                              autoComplete="email"
                            />
                            <CampoTexto
                              name="cidade"
                              label="Cidade"
                              autoComplete="address-level2"
                            />
                          </div>
                          <CampoSelect
                            name="produto"
                            label="Produto de interesse"
                            opcoes={PRODUTOS}
                          />
                          <CampoTextoLongo
                            name="mensagem"
                            label="Medidas e quantidade"
                            rows={4}
                            placeholder="Ex.: 3 m³ de pinus 2,5 × 30 × 3,00 m, 2ª linha, entrega em Ponta Grossa"
                          />
                          {/* armadilha para robôs */}
                          <input
                            type="text"
                            tabIndex={-1}
                            autoComplete="off"
                            aria-hidden
                            className="hidden"
                            {...form.register("site")}
                          />
                          <BotaoAnimado
                            type="submit"
                            disabled={pendente}
                            seta={false}
                            icone={
                              pendente ? (
                                <Loader2 className="size-5 animate-spin" />
                              ) : (
                                <Send className="size-5" />
                              )
                            }
                            className="w-full sm:w-auto"
                          >
                            Enviar pedido de orçamento
                          </BotaoAnimado>
                        </FieldGroup>
                      </form>
                    </FormProvider>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Revelar>
        </div>
      </div>
    </section>
  )
}
