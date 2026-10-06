import { describe, expect, it } from "vitest"

import {
  cnpjValido,
  cpfValido,
  normalizarPlaca,
  zDocumento,
  zNumeroBR,
  zNumeroBROpcional,
  zPlaca,
} from "./validacao"

describe("documentos", () => {
  it("valida CPF", () => {
    expect(cpfValido("529.982.247-25")).toBe(true)
    expect(cpfValido("529.982.247-24")).toBe(false)
    expect(cpfValido("111.111.111-11")).toBe(false)
  })
  it("valida CNPJ", () => {
    expect(cnpjValido("11.222.333/0001-81")).toBe(true)
    expect(cnpjValido("11.222.333/0001-80")).toBe(false)
    expect(cnpjValido("00.000.000/0000-00")).toBe(false)
  })
  it("zDocumento devolve só dígitos", () => {
    expect(zDocumento.parse("11.222.333/0001-81")).toBe("11222333000181")
    expect(zDocumento.safeParse("123").success).toBe(false)
  })
})

describe("placa", () => {
  it("normaliza e valida antiga e Mercosul", () => {
    expect(normalizarPlaca("abc-1234")).toBe("ABC1234")
    expect(zPlaca.parse("abc1d23")).toBe("ABC1D23")
    expect(zPlaca.safeParse("AB12345").success).toBe(false)
  })
})

describe("números digitados", () => {
  it("aceita vírgula", () => {
    expect(zNumeroBR().parse("1,8")).toBe(1.8)
    expect(zNumeroBR().parse("1.234,56")).toBe(1234.56)
  })
  it("valida mínimo", () => {
    expect(zNumeroBR({ maiorQueZero: true }).safeParse("0").success).toBe(false)
  })
  it("opcional vazio vira null", () => {
    expect(zNumeroBROpcional().parse("")).toBeNull()
  })
})
