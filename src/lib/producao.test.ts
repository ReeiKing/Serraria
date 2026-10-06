import { describe, expect, it } from "vitest"

import { calcularProducao, normalizarBitola } from "./producao"

describe("calcularProducao", () => {
  it("volume por linha, total e rendimento", () => {
    const r = calcularProducao(
      [
        { espessuraCm: "1,8", larguraCm: "9", comprimentoM: "1,20", quantidade: "100" },
        { espessuraCm: "2,5", larguraCm: "30", comprimentoM: "3", quantidade: "40" },
      ],
      "3"
    )
    expect(r.linhas[0]).toMatchObject({ volumePecaM3: 0.001944, volumeTotalM3: 0.1944 })
    expect(r.linhas[1]!.volumeTotalM3).toBe(0.9)
    expect(r.volumeSerradoM3).toBe(1.0944)
    expect(r.totalPecas).toBe(140)
    expect(r.rendimento).toBe(36.48)
  })
  it("linhas incompletas não contam e sem tora não há rendimento", () => {
    const r = calcularProducao([
      { espessuraCm: "", larguraCm: "9", comprimentoM: "1,2", quantidade: "10" },
    ])
    expect(r.volumeSerradoM3).toBe(0)
    expect(r.rendimento).toBeNull()
  })
})

describe("normalizarBitola", () => {
  it.each([
    ["1,8 x 9", "1.8x9"],
    ["1,8 × 9 × 1,20", "1.8x9x1.2"],
    ["2,50 x 30,00 x 3,00", "2.5x30x3"],
    ["5x10", "5x10"],
  ])("%s → %s", (a, b) => expect(normalizarBitola(a)).toBe(b))
})
