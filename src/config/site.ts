/**
 * Textos e dados da madeireira exibidos no site público e no sistema.
 * Personalize tudo aqui: nome, contatos, produtos, números, FAQ.
 * Itens marcados como EXEMPLO devem ser trocados pelos dados reais do cliente.
 */
export const siteConfig = {
  nome: "Serraria Modelo",
  nomeCurto: "Serraria",
  slogan: "Madeira serrada de Pinus e Eucalipto, do pátio à sua obra.",
  descricao:
    "Serraria especializada em madeira serrada de Pinus e Eucalipto de floresta plantada. Bitolas sob medida, qualidade classificada e entrega no seu endereço.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  fundacao: 2004, // EXEMPLO
  contato: {
    telefone: "(42) 3000-0000", // EXEMPLO
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || "5542999990000", // EXEMPLO
    email: "contato@serrariamodelo.com.br", // EXEMPLO
    horario: "Seg a Sex, 7h às 17h · Sáb, 7h às 11h",
  },
  endereco: {
    logradouro: "Rodovia Exemplo, km 0", // EXEMPLO
    municipio: "Ponta Grossa",
    uf: "PR",
    cep: "84000-000",
  },

  hero: {
    selo: "Floresta plantada · origem controlada",
    titulo: "Madeira serrada com",
    destaque: "medida certa",
    complemento: "e entrega no prazo.",
    subtitulo:
      "Pinus e Eucalipto em bitolas padrão ou sob encomenda, classificados em 1ª, 2ª e 3ª linha. Do pátio da serraria direto para a sua obra, marcenaria ou indústria.",
  },

  numeros: [
    { valor: 1800, sufixo: " m³", rotulo: "serrados por mês" }, // EXEMPLO
    { valor: 20, sufixo: "+", rotulo: "anos de mercado" }, // EXEMPLO
    { valor: 350, sufixo: "+", rotulo: "clientes atendidos" }, // EXEMPLO
    { valor: 48, sufixo: "h", rotulo: "prazo médio de carga" }, // EXEMPLO
  ],

  produtos: [
    {
      especie: "Pinus",
      cientifico: "Pinus spp.",
      descricao:
        "Leve, fácil de trabalhar e ótimo acabamento. Ideal para construção civil, embalagens, paletes e móveis.",
      bitolas: ["2,5 × 10 cm", "2,5 × 15 cm", "2,5 × 30 cm", "5 × 5 cm", "5 × 10 cm", "1,8 × 9 cm"],
      usos: ["Formas e escoramento", "Paletes e embalagens", "Móveis e marcenaria"],
      cor: "from-amber-200 via-amber-300 to-orange-300",
    },
    {
      especie: "Eucalipto",
      cientifico: "Eucalyptus spp.",
      descricao:
        "Denso e resistente. Indicado para estruturas, tesouras, vigamentos, cercas e uso rural.",
      bitolas: [
        "5 × 15 cm",
        "6 × 12 cm",
        "6 × 16 cm",
        "2,5 × 20 cm",
        "3 × 15 cm",
        "Vigas sob medida",
      ],
      usos: ["Estruturas e telhados", "Vigas e caibros", "Uso rural e cercas"],
      cor: "from-orange-300 via-red-300 to-rose-300",
    },
  ],

  qualidades: [
    { nome: "1ª linha", descricao: "Peças limpas, sem nós soltos, para acabamento aparente." },
    { nome: "2ª linha", descricao: "Poucos nós firmes. Ótimo custo-benefício para estrutura." },
    { nome: "3ª linha", descricao: "Uso geral, formas, embalagens e obras temporárias." },
  ],

  etapas: [
    {
      titulo: "Floresta plantada",
      descricao: "Toras de Pinus e Eucalipto de reflorestamento, com origem conferida na entrada.",
    },
    {
      titulo: "Recebimento e medição",
      descricao: "Cada carga é medida (m³, estéreo ou peso) e registrada no sistema.",
    },
    {
      titulo: "Serragem",
      descricao: "Desdobro em bitolas padrão ou sob medida, com controle de rendimento.",
    },
    {
      titulo: "Classificação",
      descricao: "Peças separadas em 1ª, 2ª e 3ª linha e organizadas no estoque.",
    },
    {
      titulo: "Carga e entrega",
      descricao: "Romaneio conferido peça a peça, nota fiscal e entrega no seu endereço.",
    },
  ],

  // PLACEHOLDER — substitua por depoimentos reais (com autorização dos clientes).
  depoimentos: [
    {
      texto: "Texto de exemplo: madeira bem serrada, bitola certinha e entrega no dia combinado.",
      autor: "Nome do cliente",
      cargo: "Construtora (exemplo)",
    },
    {
      texto: "Texto de exemplo: atendimento rápido pelo WhatsApp e romaneio conferido na descarga.",
      autor: "Nome do cliente",
      cargo: "Marcenaria (exemplo)",
    },
    {
      texto: "Texto de exemplo: compramos eucalipto para estrutura há anos. Qualidade constante.",
      autor: "Nome do cliente",
      cargo: "Produtor rural (exemplo)",
    },
  ],

  faq: [
    {
      pergunta: "Vocês vendem para pessoa física?",
      resposta:
        "Sim. Atendemos pessoas físicas, construtoras, marcenarias e indústrias, com emissão de nota fiscal.",
    },
    {
      pergunta: "Qual o pedido mínimo?",
      resposta:
        "Depende da bitola e do frete. Fale com a gente pelo WhatsApp que montamos a melhor carga para você.",
    },
    {
      pergunta: "Vocês fazem medidas sob encomenda?",
      resposta:
        "Sim. Além das bitolas padrão, serramos sob medida conforme a disponibilidade de toras.",
    },
    {
      pergunta: "Como é calculado o preço?",
      resposta:
        "A madeira serrada é vendida por metro cúbico (m³), de acordo com a espécie e a qualidade (1ª, 2ª ou 3ª linha).",
    },
    {
      pergunta: "A madeira precisa de DOF?",
      resposta:
        "Pinus e Eucalipto de floresta plantada normalmente não exigem DOF do IBAMA, diferente de madeira nativa. Na dúvida, consulte o órgão ambiental do seu estado.",
    },
    {
      pergunta: "Vocês entregam?",
      resposta:
        "Sim, com frete CIF (por nossa conta no preço) ou FOB (você retira ou contrata o frete).",
    },
  ],
} as const

export type SiteConfig = typeof siteConfig

export function linkWhatsApp(
  mensagem = `Olá! Vim pelo site da ${siteConfig.nome} e gostaria de um orçamento.`
) {
  return `https://wa.me/${siteConfig.contato.whatsapp}?text=${encodeURIComponent(mensagem)}`
}
