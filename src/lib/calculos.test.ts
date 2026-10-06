import { describe, expect, it } from "vitest"

import {
  kgParaToneladas,
  paraNumeric,
  pesoLiquido,
  rendimento,
  somar,
  totalVenda,
  valorTotal,
  volumeEstereo,
  volumePecaM3,
  volumePecasM3,
  volumeToraM3,
} from "./calculos"

describe("volumePecaM3", () => {
  it("1,8 cm × 9 cm × 1,20 m = 0,001944 m³", () => {
    expect(volumePecaM3(1.8, 9, 1.2)).toBe(0.001944)
  })
  it("aceita strings decimais", () => {
    expect(volumePecaM3("1.8", "9", "1.20")).toBe(0.001944)
  })
  it("tábua 2,5 × 30 × 3,00 = 0,0225 m³", () => {
    expect(volumePecaM3(2.5, 30, 3)).toBe(0.0225)
  })
  it("arredonda para 6 casas", () => {
    expect(volumePecaM3(1.7, 7.3, 2.15)).toBe(0.002668) // 0,00266815
  })
})

describe("volumePecasM3", () => {
  it("100 peças de 1,8 × 9 × 1,20 = 0,1944 m³", () => {
    expect(volumePecasM3(1.8, 9, 1.2, 100)).toBe(0.1944)
  })
  it("não acumula erro de arredondamento por peça", () => {
    // 1000 × 0,00266815 = 2,66815 (arredondar a peça antes daria 2,668)
    expect(volumePecasM3(1.7, 7.3, 2.15, 1000)).toBe(2.66815)
  })
})

describe("volumeToraM3", () => {
  it("tora de 30 cm × 2,40 m ≈ 0,169646 m³", () => {
    expect(volumeToraM3(30, 2.4)).toBe(0.169646)
  })
  it("quantidade de toras de mesmo diâmetro", () => {
    expect(volumeToraM3(20, 2.4, 10)).toBe(0.753982)
  })
  it("diâmetro zero dá zero", () => {
    expect(volumeToraM3(0, 2.4)).toBe(0)
  })
})

describe("volumeEstereo", () => {
  it("carga 7,20 × 2,50 × 2,80 = 50,4 st", () => {
    expect(volumeEstereo(7.2, 2.5, 2.8)).toBe(50.4)
  })
})

describe("pesoLiquido", () => {
  it("bruto − tara", () => {
    expect(pesoLiquido(45_300, 15_250)).toBe(30_050)
  })
  it("nunca negativo", () => {
    expect(pesoLiquido(10_000, 12_000)).toBe(0)
  })
  it("converte para toneladas", () => {
    expect(kgParaToneladas(30_050)).toBe(30.05)
  })
})

describe("valorTotal", () => {
  it("sem erro de ponto flutuante", () => {
    expect(valorTotal(0.1, 3)).toBe(0.3)
    expect(valorTotal(1.005, 1)).toBe(1.01)
  })
  it("0,1944 m³ × R$ 1.200,00 = R$ 233,28", () => {
    expect(valorTotal(0.1944, 1200)).toBe(233.28)
  })
  it("arredonda meia para cima", () => {
    expect(valorTotal(50.4, 85.55)).toBe(4311.72) // 4311,72
    expect(valorTotal(0.125, 1)).toBe(0.13)
  })
})

describe("rendimento", () => {
  it("m³ serrado ÷ m³ tora em %", () => {
    expect(rendimento(4.5, 10)).toBe(45)
    expect(rendimento(1, 3)).toBe(33.33)
  })
  it("sem tora consumida retorna null", () => {
    expect(rendimento(4.5, 0)).toBeNull()
  })
})

describe("auxiliares", () => {
  it("soma precisa", () => {
    expect(somar([0.1, 0.2])).toBe(0.3)
    expect(somar(["0.001944", "0.001944"])).toBe(0.003888)
  })
  it("total da venda", () => {
    expect(totalVenda(1000, 150, 50)).toBe(1100)
    expect(totalVenda(100, 0, 200)).toBe(0)
  })
  it("string para coluna numeric", () => {
    expect(paraNumeric(0.1944, 6)).toBe("0.194400")
    expect(paraNumeric("233.275", 2)).toBe("233.28")
  })
})
