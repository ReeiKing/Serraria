"use client"

import { Revelar, TituloSecao } from "@/components/site/revelar"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { siteConfig } from "@/config/site"

export function Faq() {
  return (
    <section id="faq" className="bg-secondary/60 scroll-mt-20 py-24">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <TituloSecao selo="Dúvidas" titulo="Perguntas frequentes" />
        <Revelar>
          <Accordion type="single" collapsible className="flex flex-col gap-3">
            {siteConfig.faq.map((f, i) => (
              <AccordionItem
                key={f.pergunta}
                value={`item-${i}`}
                className="bg-card rounded-2xl border px-6 shadow-sm transition-shadow data-[state=open]:shadow-md"
              >
                <AccordionTrigger className="py-5 text-left text-base font-semibold hover:no-underline">
                  {f.pergunta}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 text-base">
                  {f.resposta}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Revelar>
      </div>
    </section>
  )
}
