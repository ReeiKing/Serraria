import type { Metadata } from "next"

import { Cabecalho } from "@/components/site/secoes/cabecalho"
import { ComoFunciona } from "@/components/site/secoes/como-funciona"
import { Contato } from "@/components/site/secoes/contato"
import { Depoimentos } from "@/components/site/secoes/depoimentos"
import { Diferenciais } from "@/components/site/secoes/diferenciais"
import { Faq } from "@/components/site/secoes/faq"
import { Hero } from "@/components/site/secoes/hero"
import { Produtos } from "@/components/site/secoes/produtos"
import { Rodape } from "@/components/site/secoes/rodape"
import { WhatsAppFlutuante } from "@/components/site/secoes/whatsapp"
import { siteConfig } from "@/config/site"

export const metadata: Metadata = {
  title: `${siteConfig.nome} — Pinus e Eucalipto serrados`,
  description: siteConfig.descricao,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteConfig.url,
    siteName: siteConfig.nome,
    title: `${siteConfig.nome} — Pinus e Eucalipto serrados`,
    description: siteConfig.descricao,
  },
}

const dadosEstruturados = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: siteConfig.nome,
  description: siteConfig.descricao,
  url: siteConfig.url,
  telephone: siteConfig.contato.telefone,
  email: siteConfig.contato.email,
  foundingDate: String(siteConfig.fundacao),
  address: {
    "@type": "PostalAddress",
    streetAddress: siteConfig.endereco.logradouro,
    addressLocality: siteConfig.endereco.municipio,
    addressRegion: siteConfig.endereco.uf,
    postalCode: siteConfig.endereco.cep,
    addressCountry: "BR",
  },
  makesOffer: siteConfig.produtos.map((p) => ({
    "@type": "Offer",
    itemOffered: { "@type": "Product", name: `Madeira serrada de ${p.especie}` },
  })),
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dadosEstruturados) }}
      />
      <Cabecalho />
      <main>
        <Hero />
        <Diferenciais />
        <Produtos />
        <ComoFunciona />
        <Depoimentos />
        <Faq />
        <Contato />
      </main>
      <Rodape />
      <WhatsAppFlutuante />
    </>
  )
}
