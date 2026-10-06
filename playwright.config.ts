import { defineConfig, devices } from "@playwright/test"

/**
 * Testes de ponta a ponta. Usam o servidor de desenvolvimento em http://localhost:3000
 * (inicia sozinho se não estiver rodando) e o Supabase local (`npm run db:start`).
 * Atenção: criam registros reais no banco local (entradas, produção, vendas).
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
