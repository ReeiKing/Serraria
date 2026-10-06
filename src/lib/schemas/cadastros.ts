import { z } from "zod"

import {
  zCepOpcional,
  zCodigoIbgeOpcional,
  zCpfOpcional,
  zData,
  zDocumento,
  zDocumentoOpcional,
  zEmailOpcional,
  zNumeroBR,
  zNumeroBROpcional,
  zPlaca,
  zTelefoneOpcional,
  zTextoObrigatorio,
  zTextoOpcional,
  zUfOpcional,
  zUuid,
  zUuidOpcional,
} from "@/lib/validacao"

// Os nomes dos campos seguem o schema Drizzle (camelCase) para gravar direto.

export const fornecedorSchema = z.object({
  nome: zTextoObrigatorio("Nome"),
  documento: zDocumentoOpcional,
  ie: zTextoOpcional,
  telefone: zTelefoneOpcional,
  email: zEmailOpcional,
  cep: zCepOpcional,
  logradouro: zTextoOpcional,
  numero: zTextoOpcional,
  bairro: zTextoOpcional,
  municipio: zTextoOpcional,
  uf: zUfOpcional,
  observacoes: zTextoOpcional,
})

export const INDICADORES_IE = [
  { valor: "1", rotulo: "Contribuinte do ICMS" },
  { valor: "2", rotulo: "Contribuinte isento" },
  { valor: "9", rotulo: "Não contribuinte" },
] as const

export const clienteSchema = z.object({
  razaoSocial: zTextoObrigatorio("Razão social / nome"),
  nomeFantasia: zTextoOpcional,
  documento: zDocumento,
  ie: zTextoOpcional,
  indicadorIe: z.enum(["1", "2", "9"]).transform(Number),
  email: zEmailOpcional,
  telefone: zTelefoneOpcional,
  cep: zCepOpcional,
  logradouro: zTextoOpcional,
  numero: zTextoOpcional,
  complemento: zTextoOpcional,
  bairro: zTextoOpcional,
  municipio: zTextoOpcional,
  codigoIbge: zCodigoIbgeOpcional,
  uf: zUfOpcional,
  observacoes: zTextoOpcional,
})

export const motoristaSchema = z.object({
  nome: zTextoObrigatorio("Nome"),
  cpf: zCpfOpcional,
  cnh: zTextoOpcional,
  telefone: zTelefoneOpcional,
  transportadora: zTextoOpcional,
})

export const TIPOS_VEICULO = [
  { valor: "caminhonete", rotulo: "Caminhonete" },
  { valor: "toco", rotulo: "Toco" },
  { valor: "truck", rotulo: "Truck" },
  { valor: "carreta", rotulo: "Carreta" },
  { valor: "bitrem", rotulo: "Bitrem" },
  { valor: "rodotrem", rotulo: "Rodotrem" },
  { valor: "outro", rotulo: "Outro" },
] as const

export const veiculoSchema = z.object({
  placa: zPlaca,
  tipo: z.enum(["caminhonete", "toco", "truck", "carreta", "bitrem", "rodotrem", "outro"]),
  taraKg: zNumeroBROpcional({ min: 0, rotulo: "Tara" }),
  uf: zUfOpcional,
  rntc: zTextoOpcional,
  motoristaPadraoId: zUuidOpcional,
})

const zNcm = z
  .string()
  .transform((v) => v.replace(/\D/g, ""))
  .refine((v) => v === "" || v.length === 8, "NCM tem 8 dígitos")
  .transform((v) => (v === "" ? null : v))

export const especieSchema = z.object({
  nome: zTextoObrigatorio("Nome"),
  nomeCientifico: zTextoOpcional,
  conifera: z.boolean(),
  ncmSerrada: zNcm,
  ncmTora: zNcm,
})

export const qualidadeSchema = z.object({
  nome: zTextoObrigatorio("Nome"),
  ordem: zNumeroBR({ min: 1, rotulo: "Ordem" }).refine(Number.isInteger, "Ordem deve ser inteira"),
})

export const precoSchema = z
  .object({
    tipo: z.enum(["compra_tora", "venda_serrada"]),
    especieId: zUuid("a espécie"),
    qualidadeId: zUuidOpcional,
    unidade: z.enum(["st", "m3", "t"]),
    valor: zNumeroBR({ min: 0, rotulo: "Valor" }),
    vigenciaInicio: zData,
    observacao: zTextoOpcional,
  })
  .superRefine((p, ctx) => {
    if (p.tipo === "venda_serrada") {
      if (!p.qualidadeId)
        ctx.addIssue({ code: "custom", path: ["qualidadeId"], message: "Selecione a qualidade" })
      if (p.unidade !== "m3")
        ctx.addIssue({ code: "custom", path: ["unidade"], message: "Venda é sempre por m³" })
    }
  })
  .transform((p) => (p.tipo === "compra_tora" ? { ...p, qualidadeId: null } : p))

export const REGIMES = [
  { valor: "1", rotulo: "1 · Simples Nacional" },
  { valor: "2", rotulo: "2 · Simples Nacional (excesso de sublimite)" },
  { valor: "3", rotulo: "3 · Regime Normal" },
  { valor: "4", rotulo: "4 · MEI" },
] as const

const zCodigoFiscal = (rotulo: string, tamanhos: number[]) =>
  z
    .string()
    .trim()
    .refine(
      (v) => v === "" || (/^\d+$/.test(v) && tamanhos.includes(v.length)),
      `${rotulo} inválido`
    )
    .transform((v) => (v === "" ? null : v))

export const empresaSchema = z.object({
  razaoSocial: zTextoObrigatorio("Razão social"),
  nomeFantasia: zTextoOpcional,
  cnpj: zDocumento.refine((v) => v.length === 14, "Informe o CNPJ"),
  ie: zTextoOpcional,
  im: zTextoOpcional,
  crt: z.enum(["1", "2", "3", "4"]).transform(Number),
  cep: zCepOpcional,
  logradouro: zTextoOpcional,
  numero: zTextoOpcional,
  complemento: zTextoOpcional,
  bairro: zTextoOpcional,
  municipio: zTextoOpcional,
  codigoIbge: zCodigoIbgeOpcional,
  uf: zUfOpcional,
  telefone: zTelefoneOpcional,
  email: zEmailOpcional,
  nfeSerie: zNumeroBR({ min: 0, max: 999, rotulo: "Série" }).refine(
    Number.isInteger,
    "Série inteira"
  ),
  nfeProximoNumero: zNumeroBR({ min: 1, rotulo: "Próximo número" }).refine(
    Number.isInteger,
    "Número inteiro"
  ),
  cfopInterno: zCodigoFiscal("CFOP", [4]).refine((v) => v !== null, "Informe o CFOP"),
  cfopInterestadual: zCodigoFiscal("CFOP", [4]).refine((v) => v !== null, "Informe o CFOP"),
  csosn: zCodigoFiscal("CSOSN", [3]),
  cstIcms: zCodigoFiscal("CST", [2, 3]),
  aliquotaIcms: zNumeroBR({ min: 0, max: 100, rotulo: "Alíquota" }),
  cstPis: zCodigoFiscal("CST PIS", [2]).refine((v) => v !== null, "Informe o CST"),
  aliquotaPis: zNumeroBR({ min: 0, max: 100, rotulo: "Alíquota" }),
  cstCofins: zCodigoFiscal("CST COFINS", [2]).refine((v) => v !== null, "Informe o CST"),
  aliquotaCofins: zNumeroBR({ min: 0, max: 100, rotulo: "Alíquota" }),
  informacoesComplementares: zTextoOpcional,
})

export const novoUsuarioSchema = z.object({
  nome: zTextoObrigatorio("Nome"),
  email: z.string().trim().pipe(z.email("E-mail inválido")),
  senha: z.string().min(8, "Mínimo de 8 caracteres"),
})

export const senhaSchema = z.object({
  senha: z.string().min(8, "Mínimo de 8 caracteres"),
})
