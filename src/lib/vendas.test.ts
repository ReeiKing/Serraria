import { describe, expect, it } from "vitest"

import { calcularVenda, descricaoItem } from "./vendas"

describe("calcularVenda", () => {
  it("volume, valor por item e totais", () => {
    const r = calcularVenda(
      [
        {
          espessuraCm: 1.8,
          larguraCm: 9,
          comprimentoM: 1.2,
          quantidade: "100",
          precoM3: "1.200",
        },
        {
          espessuraCm: "2.50",
          larguraCm: "30.00",
          comprimentoM: "3.000",
          quantidade: "40",
          precoM3: "1000",
        },
      ],
      "150",
      "33,28"
    )
    expect(r.linhas[0]).toMatchObject({ volumeM3: 0.1944, valor: 233.28 })
    expect(r.linhas[1]).toMatchObject({ volumeM3: 0.9, valor: 900 })
    expect(r.totalPecas).toBe(140)
    expect(r.totalM3).toBe(1.0944)
    expect(r.valorProdutos).toBe(1133.28)
    expect(r.valorTotal).toBe(1250)
  })
  it("medidas vindas do banco como texto técnico ('1.200' = 1,2 m)", () => {
    const r = calcularVenda([
      {
        espessuraCm: "1.80",
        larguraCm: "9.00",
        comprimentoM: "1.200",
        quantidade: "100",
        precoM3: "1.200",
      },
    ])
    expect(r.totalM3).toBe(0.1944)
    expect(r.valorTotal).toBe(233.28)
  })
  it("item sem quantidade não soma", () => {
    expect(
      calcularVenda([
        { espessuraCm: 5, larguraCm: 10, comprimentoM: 3, quantidade: "", precoM3: 1000 },
      ]).valorTotal
    ).toBe(0)
  })
  it("descrição para romaneio/NF-e", () => {
    expect(
      descricaoItem({
        especie: "Pinus",
        qualidade: "1ª linha",
        espessuraCm: "1.80",
        larguraCm: "9.00",
        comprimentoM: "1.200",
      })
    ).toBe("Madeira serrada de Pinus 1,8 × 9 × 1,20 m - 1ª linha")
  })
})
