/**
 * Dados da madeireira exibidos no site público e no sistema.
 * Personalize aqui: nome, textos e contatos. (A landing completa usa mais campos — Fase 10.)
 */
export const siteConfig = {
  nome: "Serraria Modelo",
  nomeCurto: "Serraria",
  slogan: "Madeira serrada de Pinus e Eucalipto, do pátio à sua obra.",
  descricao:
    "Serraria especializada em madeira serrada de Pinus e Eucalipto de floresta plantada. Bitolas sob medida, qualidade classificada e entrega no seu endereço.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  contato: {
    telefone: "(42) 0000-0000",
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "",
    email: "contato@serrariamodelo.com.br",
  },
  endereco: {
    logradouro: "Rodovia Exemplo, km 0",
    municipio: "Cidade",
    uf: "PR",
    cep: "00000-000",
  },
} as const

export type SiteConfig = typeof siteConfig
