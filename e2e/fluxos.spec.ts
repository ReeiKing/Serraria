import { expect, test, type Page } from "@playwright/test"

async function entrar(page: Page) {
  await page.goto("/login")
  await page.fill("#email", "secretaria@madeireira.local")
  await page.fill("#senha", "madeira123")
  await page.click("button[type=submit]")
  await page.waitForURL("**/sistema")
}

test("login: protege o sistema e recusa senha errada", async ({ page }) => {
  await page.goto("/sistema/estoque")
  await expect(page).toHaveURL(/\/login\?proximo=/)
  await page.fill("#email", "secretaria@madeireira.local")
  await page.fill("#senha", "errada123")
  await page.click("button[type=submit]")
  await expect(page.getByText("E-mail ou senha incorretos.")).toBeVisible()
})

test("entrada de toras por m³ calcula volume e valor", async ({ page }) => {
  await entrar(page)
  await page.goto("/sistema/entradas/nova")
  await page.getByRole("radio", { name: "Pinus" }).click()
  await page.getByRole("combobox", { name: "Fornecedor" }).click()
  await page.getByRole("option").first().click()
  await page.fill("[id=valorUnitario]", "150")
  await page.fill("[aria-label='diametroCm da linha 1']", "30")
  await page.fill("[aria-label='comprimentoM da linha 1']", "2,4")
  await expect(page.locator("form aside")).toContainText("0,169646")
  await expect(page.locator("form aside")).toContainText("R$ 25,45")
  await page.getByRole("button", { name: "Registrar entrada" }).first().click()
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Entrada nº")
  await expect(page.getByText(/Registrada em \d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/)).toBeVisible()
})

test("produção 1,8 × 9 × 1,20 com 100 peças = 0,1944 m³ e entra no estoque", async ({ page }) => {
  await entrar(page)
  await page.goto("/sistema/producao/nova")
  await page.getByRole("radio", { name: "Pinus" }).click()
  await page.fill("[aria-label='Esp. (cm) da linha 1']", "1,8")
  await page.fill("[aria-label='Larg. (cm) da linha 1']", "9")
  await page.fill("[aria-label='Compr. (m) da linha 1']", "1,20")
  await page.fill("[aria-label='Peças da linha 1']", "100")
  await expect(page.locator("form aside")).toContainText("0,1944")
  await page.getByRole("button", { name: "Lançar produção" }).first().click()
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Produção nº")
  await page.goto("/sistema/estoque")
  await page.getByPlaceholder("Buscar medida, ex.: 1,8 x 9").fill("1,8 x 9")
  await expect(page.locator("tbody tr").first()).toContainText("1,8 × 9 × 1,20")
})

test("venda confirmada gera romaneio em PDF", async ({ page }) => {
  await entrar(page)
  await page.goto("/sistema/vendas/nova")
  await page.getByRole("combobox", { name: "Cliente" }).click()
  await page.getByRole("option").first().click()
  await page.getByRole("combobox", { name: "Bitola da linha 1" }).click()
  await page.getByPlaceholder("Buscar: pinus, 1,8 x 9, 1ª…").fill("1,8 x 9")
  await page.getByRole("option").first().click()
  await page.fill("[aria-label='Peças da linha 1']", "10")
  await page.locator("form aside").getByRole("button", { name: "Salvar e confirmar" }).click()
  await page.waitForURL(/\/sistema\/vendas\/[0-9a-f-]{36}$/)
  await expect(page.getByText(/Romaneio nº \d+/).first()).toBeVisible()
  const pdf = await page.request.get(`${page.url()}/romaneio`)
  expect(pdf.status()).toBe(200)
  expect(pdf.headers()["content-type"]).toBe("application/pdf")
})

test("relatórios exportam Excel e PDF", async ({ page }) => {
  await entrar(page)
  for (const formato of ["xlsx", "pdf"]) {
    const r = await page.request.get(
      `/sistema/relatorios/exportar?tipo=vendas&periodo=90d&formato=${formato}`
    )
    expect(r.status()).toBe(200)
    expect((await r.body()).length).toBeGreaterThan(1000)
  }
})
