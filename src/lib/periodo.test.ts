import { describe, expect, it } from "vitest"

import { resolverPeriodo } from "./periodo"

// 06/10/2026 01:00 UTC = 05/10/2026 22:00 em São Paulo
const AGORA = new Date("2026-10-06T01:00:00Z")

describe("resolverPeriodo", () => {
  it("este mês no fuso de SP", () => {
    expect(resolverPeriodo({}, AGORA)).toMatchObject({ de: "2026-10-01", ate: "2026-10-31" })
  })
  it("mês anterior", () => {
    expect(resolverPeriodo({ periodo: "mes-anterior" }, AGORA)).toMatchObject({
      de: "2026-09-01",
      ate: "2026-09-30",
    })
  })
  it("últimos 30 dias termina hoje em SP (dia 05)", () => {
    expect(resolverPeriodo({ periodo: "30d" }, AGORA)).toMatchObject({
      de: "2026-09-06",
      ate: "2026-10-05",
    })
  })
  it("personalizado inverte datas trocadas e ignora inválidas", () => {
    expect(
      resolverPeriodo({ periodo: "custom", de: "2026-09-30", ate: "2026-09-01" }, AGORA)
    ).toMatchObject({ de: "2026-09-01", ate: "2026-09-30" })
    expect(resolverPeriodo({ periodo: "custom", de: "xx" }, AGORA).de).toBe("2026-10-01")
  })
  it("período desconhecido cai em este mês", () => {
    expect(resolverPeriodo({ periodo: "abc" }, AGORA).chave).toBe("mes")
  })
})
