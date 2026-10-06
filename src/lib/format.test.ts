import { describe, expect, it } from "vitest"

import {
  formatData,
  formatDataHora,
  formatM3,
  formatMoeda,
  formatNumero,
  formatPercentual,
  parseNumeroBR,
} from "./format"

// Intl usa espaço não separável entre "R$" e o valor.
const nbsp = (s: string) => s.replace(/ /g, " ")

describe("formatação brasileira", () => {
  it("formata moeda", () => {
    expect(nbsp(formatMoeda(1234.56))).toBe("R$ 1.234,56")
    expect(nbsp(formatMoeda("0.5"))).toBe("R$ 0,50")
    expect(nbsp(formatMoeda(null))).toBe("R$ 0,00")
  })

  it("formata números e volumes", () => {
    expect(formatNumero(1234.5)).toBe("1.234,50")
    expect(formatM3(0.001944)).toBe("0,001944")
    expect(formatM3(0.1944)).toBe("0,1944")
    expect(formatM3(12)).toBe("12,000")
    expect(formatPercentual(45.33)).toBe("45,3%")
  })

  it("formata datas no fuso de São Paulo", () => {
    // 15:30 UTC = 12:30 em São Paulo (UTC-3)
    expect(formatDataHora("2026-10-06T15:30:00Z")).toBe("06/10/2026 12:30")
    // 01:00 UTC ainda é o dia anterior em São Paulo
    expect(formatData("2026-10-06T01:00:00Z")).toBe("05/10/2026")
  })
})

describe("parseNumeroBR", () => {
  it.each([
    ["1,8", 1.8],
    ["1.234,56", 1234.56],
    ["R$ 1.234,56", 1234.56],
    ["1.8", 1.8],
    ["1.234.567", 1234567],
    ["9", 9],
    ["-2,5", -2.5],
    ["0,001944", 0.001944],
    [",5", 0.5],
    [3.14, 3.14],
  ])("%s → %s", (entrada, esperado) => {
    expect(parseNumeroBR(entrada)).toBe(esperado)
  })

  it.each(["", "abc", "1,2,3", "1..2", null, undefined])("rejeita %s", (entrada) => {
    expect(parseNumeroBR(entrada)).toBeNull()
  })
})
