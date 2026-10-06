import { z } from "zod"

import { parseNumeroBR } from "./format"
import { UFS } from "./uf"

export const soDigitos = (s: string | null | undefined) => (s ?? "").replace(/\D/g, "")

export function cpfValido(valor: string): boolean {
  const cpf = soDigitos(valor)
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false
  const dv = (base: string, pesoInicial: number) => {
    const soma = [...base].reduce((acc, d, i) => acc + Number(d) * (pesoInicial - i), 0)
    const resto = (soma * 10) % 11
    return resto === 10 ? 0 : resto
  }
  return dv(cpf.slice(0, 9), 10) === Number(cpf[9]) && dv(cpf.slice(0, 10), 11) === Number(cpf[10])
}

export function cnpjValido(valor: string): boolean {
  const cnpj = soDigitos(valor)
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false
  const dv = (base: string) => {
    const pesos =
      base.length === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    const soma = [...base].reduce((acc, d, i) => acc + Number(d) * pesos[i]!, 0)
    const resto = soma % 11
    return resto < 2 ? 0 : 11 - resto
  }
  return dv(cnpj.slice(0, 12)) === Number(cnpj[12]) && dv(cnpj.slice(0, 13)) === Number(cnpj[13])
}

/** Placa antiga (ABC1234) ou Mercosul (ABC1D23), sem hífen e em maiúsculas. */
export function normalizarPlaca(valor: string): string {
  return valor.toUpperCase().replace(/[^A-Z0-9]/g, "")
}
export const PLACA_REGEX = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/

// ---------------------------------------------------------------- zod
// Os formulários trabalham com strings (como o usuário digita); o schema converte.

/** Texto opcional: vazio vira null. */
export const zTextoOpcional = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))

export const zTextoObrigatorio = (rotulo = "Campo") =>
  z.string().trim().min(1, `${rotulo} é obrigatório`)

export const zEmailOpcional = z
  .string()
  .trim()
  .refine((v) => v === "" || z.email().safeParse(v).success, "E-mail inválido")
  .transform((v) => (v === "" ? null : v.toLowerCase()))

export const zTelefoneOpcional = z
  .string()
  .transform(soDigitos)
  .refine((v) => v === "" || (v.length >= 10 && v.length <= 13), "Telefone inválido")
  .transform((v) => (v === "" ? null : v))

export const zCepOpcional = z
  .string()
  .transform(soDigitos)
  .refine((v) => v === "" || v.length === 8, "CEP deve ter 8 dígitos")
  .transform((v) => (v === "" ? null : v))

export const zUfOpcional = z
  .string()
  .refine((v) => v === "" || (UFS as readonly string[]).includes(v), "UF inválida")
  .transform((v) => (v === "" ? null : v))

export const zCodigoIbgeOpcional = z
  .string()
  .transform(soDigitos)
  .refine((v) => v === "" || v.length === 7, "Código IBGE tem 7 dígitos")
  .transform((v) => (v === "" ? null : v))

const documentoValido = (v: string) =>
  v.length === 11 ? cpfValido(v) : v.length === 14 && cnpjValido(v)

export const zDocumento = z
  .string()
  .transform(soDigitos)
  .refine(documentoValido, "CPF ou CNPJ inválido")

export const zDocumentoOpcional = z
  .string()
  .transform(soDigitos)
  .refine((v) => v === "" || documentoValido(v), "CPF ou CNPJ inválido")
  .transform((v) => (v === "" ? null : v))

export const zCpfOpcional = z
  .string()
  .transform(soDigitos)
  .refine((v) => v === "" || cpfValido(v), "CPF inválido")
  .transform((v) => (v === "" ? null : v))

export const zPlaca = z
  .string()
  .transform(normalizarPlaca)
  .refine((v) => PLACA_REGEX.test(v), "Placa inválida (ex.: ABC1D23 ou ABC1234)")

type OpcoesNumero = { min?: number; max?: number; maiorQueZero?: boolean; rotulo?: string }

function validarNumero(n: number, o: OpcoesNumero, ctx: z.RefinementCtx) {
  const r = o.rotulo ?? "Valor"
  if (o.maiorQueZero && n <= 0)
    ctx.addIssue({ code: "custom", message: `${r} deve ser maior que zero` })
  else if (o.min !== undefined && n < o.min)
    ctx.addIssue({ code: "custom", message: `${r} mínimo: ${o.min}` })
  else if (o.max !== undefined && n > o.max)
    ctx.addIssue({ code: "custom", message: `${r} máximo: ${o.max}` })
}

/** Número digitado no padrão brasileiro ("1,8"), obrigatório. */
export const zNumeroBR = (o: OpcoesNumero = {}) =>
  z.union([z.string(), z.number()]).transform((v, ctx) => {
    const n = parseNumeroBR(v)
    if (n === null) {
      ctx.addIssue({ code: "custom", message: `${o.rotulo ?? "Valor"} inválido` })
      return z.NEVER
    }
    validarNumero(n, o, ctx)
    return n
  })

/** Número BR opcional: vazio vira null. */
export const zNumeroBROpcional = (o: OpcoesNumero = {}) =>
  z.union([z.string(), z.number()]).transform((v, ctx) => {
    if (v === "") return null
    const n = parseNumeroBR(v)
    if (n === null) {
      ctx.addIssue({ code: "custom", message: `${o.rotulo ?? "Valor"} inválido` })
      return z.NEVER
    }
    validarNumero(n, o, ctx)
    return n
  })

/** Inteiro positivo (quantidade de peças). */
export const zInteiro = (o: OpcoesNumero = {}) =>
  zNumeroBR(o).refine(
    (n) => Number.isInteger(n),
    `${o.rotulo ?? "Quantidade"} deve ser um número inteiro`
  )

export const zUuid = (rotulo = "Item") => z.string().uuid(`Selecione ${rotulo.toLowerCase()}`)
export const zUuidOpcional = z
  .string()
  .transform((v) => (v === "" ? null : v))
  .pipe(z.string().uuid().nullable())

/** Data no formato yyyy-MM-dd (input type="date"). */
export const zData = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida")
