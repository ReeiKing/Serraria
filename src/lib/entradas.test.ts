import { describe, expect, it } from "vitest"

import { calcularEntrada } from "./entradas"

describe("calcularEntrada", () => {
  it("modo estéreo", () => {
    const r = calcularEntrada({
      modoMedicao: "estereo",
      cargaComprimentoM: "7,2",
      cargaLarguraM: "2,5",
      cargaAlturaM: "2,8",
      valorUnitario: "85,55",
    })
    expect(r).toMatchObject({ unidade: "st", quantidade: 50.4, valorTotal: 4311.72 })
  })
  it("modo tonelada", () => {
    const r = calcularEntrada({
      modoMedicao: "tonelada",
      pesoBrutoKg: "45.300",
      taraKg: "15.250",
      valorUnitario: "120",
    })
    expect(r).toMatchObject({
      unidade: "t",
      pesoLiquidoKg: 30050,
      quantidade: 30.05,
      valorTotal: 3606,
    })
  })
  it("modo m³ com várias linhas e quantidade", () => {
    const r = calcularEntrada({
      modoMedicao: "m3",
      toras: [
        { diametroCm: "30", comprimentoM: "2,4", quantidade: "1" },
        { diametroCm: "20", comprimentoM: "2,4", quantidade: "10" },
        { diametroCm: "", comprimentoM: "", quantidade: "1" },
      ],
      valorUnitario: "150",
    })
    expect(r.toras).toHaveLength(2)
    expect(r.totalToras).toBe(11)
    expect(r.quantidade).toBe(0.923628) // 0,169646 + 0,753982
    expect(r.valorTotal).toBe(138.54)
  })
})
