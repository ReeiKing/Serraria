// Grava o tour demonstrativo. Uso: node gravar.cjs <pasta-do-projeto> <pasta-de-saida>
const fs = require("fs")
const path = require("path")
const [proj, out] = process.argv.slice(2)
const { chromium } = require(require.resolve("@playwright/test", { paths: [proj] }))
const roteiro = JSON.parse(fs.readFileSync(path.join(out, "roteiro.json"), "utf8"))
const dur = JSON.parse(fs.readFileSync(path.join(out, "duracoes.json"), "utf8"))
const BASE = "http://localhost:3000"
const W = 1920,
  H = 1080
const espera = (ms) => new Promise((r) => setTimeout(r, ms))

// Cursor visível + legenda (injetados em toda página)
const OVERLAY = `
(() => {
  const montar = () => {
    if (document.getElementById("__demo")) return
    const st = document.createElement("style")
    st.textContent = \`
      #__cursor{position:fixed;left:0;top:0;width:28px;height:28px;z-index:2147483647;pointer-events:none;transform:translate(-4px,-2px);transition:transform .05s linear;filter:drop-shadow(0 2px 4px rgba(0,0,0,.45))}
      .__clique{position:fixed;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;border:3px solid #f59e0b;z-index:2147483646;pointer-events:none;animation:__c .55s ease-out forwards}
      @keyframes __c{from{transform:scale(.3);opacity:1}to{transform:scale(1.6);opacity:0}}
      #__demo{position:fixed;left:48px;bottom:48px;z-index:2147483645;pointer-events:none;max-width:760px;padding:22px 30px 22px 34px;border-radius:20px;
        background:rgba(28,17,9,.86);backdrop-filter:blur(10px);color:#fff7ed;box-shadow:0 20px 60px rgba(0,0,0,.45);font-family:Manrope,system-ui,sans-serif;
        border-left:8px solid #f59e0b;opacity:0;transform:translateY(24px);transition:opacity .45s ease,transform .45s cubic-bezier(.22,1,.36,1)}
      #__demo.vis{opacity:1;transform:none}
      #__demo h2{margin:0 0 6px;font:700 34px/1.1 Fraunces,Georgia,serif;color:#fbbf24}
      #__demo p{margin:0;font-size:24px;line-height:1.35}
    \`
    document.head.appendChild(st)
    const c = document.createElement("div"); c.id = "__cursor"
    c.innerHTML = '<svg viewBox="0 0 24 24" width="28" height="28"><path d="M3 2l7.5 19 2.6-7.9L21 10.5z" fill="#fff" stroke="#1c1109" stroke-width="1.6" stroke-linejoin="round"/></svg>'
    document.body.appendChild(c)
    const d = document.createElement("div"); d.id = "__demo"; d.innerHTML = "<h2></h2><p></p>"
    document.body.appendChild(d)
    const pos = window.__pos || { x: innerWidth / 2, y: innerHeight / 2 }
    c.style.left = pos.x + "px"; c.style.top = pos.y + "px"
    addEventListener("mousemove", (e) => { c.style.left = e.clientX + "px"; c.style.top = e.clientY + "px"; window.__pos = { x: e.clientX, y: e.clientY } }, true)
    addEventListener("mousedown", (e) => { const r = document.createElement("div"); r.className = "__clique"; r.style.left = e.clientX + "px"; r.style.top = e.clientY + "px"; document.body.appendChild(r); setTimeout(() => r.remove(), 600) }, true)
  }
  window.__legenda = (t, l) => { montar(); const d = document.getElementById("__demo"); d.classList.remove("vis"); setTimeout(() => { d.querySelector("h2").textContent = t; d.querySelector("p").textContent = l; d.classList.add("vis") }, 120) }
  window.__semLegenda = () => document.getElementById("__demo")?.classList.remove("vis")
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", montar); else montar()
})()
`

const CARTAO = (
  titulo,
  sub,
  itens
) => `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Manrope:wght@400;600&display=swap" rel="stylesheet">
<style>
 body{margin:0;height:100vh;display:flex;align-items:center;justify-content:center;font-family:Manrope,sans-serif;color:#fff7ed;overflow:hidden;
   background:radial-gradient(ellipse at 70% 40%,rgba(217,119,6,.35),transparent 60%),linear-gradient(135deg,#0c0a09,#2a1709 50%,#4a2810)}
 body::before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(178deg,rgba(180,83,9,.18) 0 2px,transparent 2px 46px);animation:d 20s ease-in-out infinite alternate}
 @keyframes d{to{transform:translateX(-60px)}}
 .c{position:relative;text-align:center;animation:e 1.2s cubic-bezier(.22,1,.36,1) both}
 @keyframes e{from{opacity:0;transform:translateY(40px) scale(.96)}}
 .m{width:110px;height:110px;margin:0 auto 34px;border-radius:30px;background:linear-gradient(135deg,#f59e0b,#c2410c);display:flex;align-items:center;justify-content:center;box-shadow:0 20px 50px rgba(194,65,12,.45)}
 h1{font:700 104px/1 Fraunces,serif;margin:0}
 p.s{font-size:38px;margin:22px 0 0;color:#fcd34d}
 ul{list-style:none;padding:0;margin:44px auto 0;display:grid;grid-template-columns:1fr 1fr;gap:16px 56px;text-align:left;font-size:30px;max-width:1300px}
 li{opacity:0;animation:ap .7s ease forwards}
 @keyframes ap{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
 li::before{content:"✓";color:#fbbf24;font-weight:700;margin-right:14px}
</style></head><body><div class="c">
 <div class="m"><svg viewBox="0 0 24 24" width="70" height="70" fill="none" stroke="#fff" stroke-linecap="round"><circle cx="12" cy="12" r="9" stroke-width="2"/><circle cx="12" cy="12" r="5.6" stroke-width="1.4"/><circle cx="12.4" cy="11.7" r="2.4" stroke-width="1.3"/><path d="M12 12 18 7.5" stroke-width="1.2"/></svg></div>
 <h1>${titulo}</h1><p class="s">${sub}</p>
 ${itens ? `<ul>${itens.map((t, i) => `<li style="animation-delay:${0.6 + i * 0.35}s">${t}</li>`).join("")}</ul>` : ""}
</div></body></html>`

;(async () => {
  const browser = await chromium.launch({
    channel: "chrome",
    headless: false,
    args: [
      `--window-size=${W},${H + 120}`,
      "--hide-scrollbars",
      "--disable-infobars",
      "--disable-renderer-backgrounding",
      "--disable-backgrounding-occluded-windows",
      "--disable-background-timer-throttling",
    ],
  })
  const context = await browser.newContext({
    viewport: { width: W, height: H },
    recordVideo: { dir: out, size: { width: W, height: H } },
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
  })
  await context.addInitScript(OVERLAY)
  const page = await context.newPage()
  page.setDefaultTimeout(15000)
  const t0 = Date.now()
  const linhaDoTempo = []

  const legenda = (id) => {
    const s = roteiro.find((r) => r.id === id)
    return page.evaluate(([t, l]) => window.__legenda(t, l), [s.titulo, s.legenda]).catch(() => {})
  }
  const lento = (rotulo, t) => {
    const d = Date.now() - t
    if (d > 1500) console.log(`   ⏱ ${rotulo}: ${(d / 1000).toFixed(1)}s`)
  }
  async function mover(loc, opts = {}) {
    let t = Date.now()
    await loc.scrollIntoViewIfNeeded({ timeout: 1500 }).catch(() => {})
    lento("scrollIntoView " + loc, t)
    t = Date.now()
    const b = await loc.boundingBox({ timeout: 5000 }).catch(() => null)
    lento("boundingBox " + loc, t)
    if (!b) return
    await page.mouse.move(b.x + b.width * (opts.fx ?? 0.5), b.y + b.height * (opts.fy ?? 0.5), {
      steps: opts.passos ?? 28,
    })
    await espera(opts.pausa ?? 250)
  }
  async function clicar(loc, opts) {
    await mover(loc, opts)
    await page.mouse.down()
    await page.mouse.up()
    await espera(350)
  }
  async function digitar(loc, texto, atraso = 70) {
    await clicar(loc)
    const t = Date.now()
    await loc.pressSequentially(texto, { delay: atraso })
    lento("digitar " + loc, t - texto.length * atraso)
    await espera(200)
  }
  async function substituir(loc, texto, atraso = 80) {
    await clicar(loc)
    await page.keyboard.press("Meta+A")
    await loc.pressSequentially(texto, { delay: atraso })
    await espera(200)
  }
  /** Rolagem suave até um elemento (seletor CSS ou do Playwright). */
  async function rolarAte(seletor, extra = -90, ms = 1600) {
    const b = await page
      .locator(seletor)
      .first()
      .boundingBox({ timeout: 5000 })
      .catch(() => null)
    if (!b) return
    await page.evaluate(
      async ([alvoRel, ex, dur]) => {
        const ini = scrollY,
          fim = ini + alvoRel + ex,
          t0 = performance.now()
        await new Promise((ok) => {
          const f = (t) => {
            const p = Math.min(1, (t - t0) / dur),
              e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2
            scrollTo(0, ini + (fim - ini) * e)
            p < 1 ? requestAnimationFrame(f) : ok()
          }
          requestAnimationFrame(f)
        })
      },
      [b.y, extra, ms]
    )
  }
  /** Um trecho: legenda + ações; dura pelo menos o tempo da narração. */
  async function trecho(id, preparar, acoes, { cartao = false } = {}) {
    if (preparar) await preparar()
    const inicio = Date.now()
    linhaDoTempo.push({ id, inicio: (inicio - t0) / 1000 })
    if (cartao) await page.mouse.move(W + 50, H + 50)
    else await legenda(id)
    await acoes()
    const resto = dur[id] * 1000 + 900 - (Date.now() - inicio)
    if (resto > 0) await espera(resto)
    console.log("•", id, ((Date.now() - inicio) / 1000).toFixed(1) + "s")
  }

  await trecho(
    "abertura",
    async () => {
      await page.setContent(CARTAO("Serraria Modelo", "Site + sistema de gestão para serraria"))
      await espera(700)
    },
    async () => {},
    { cartao: true }
  )

  await trecho(
    "hero",
    async () => {
      await page.goto(BASE + "/", { waitUntil: "load" })
      await espera(2500)
    },
    async () => {
      await mover(page.getByRole("link", { name: "Solicitar orçamento" }).first(), { pausa: 1200 })
      await mover(page.getByRole("link", { name: "Ver produtos" }).first(), { pausa: 1200 })
      await page.mouse.move(1450, 520, { steps: 40 })
    }
  )

  await trecho("produtos", null, async () => {
    await rolarAte("#diferenciais", -40, 1800)
    await espera(1200)
    await mover(page.getByText("Serragem precisa"), { pausa: 700 })
    await rolarAte("#produtos", -40, 1500)
    await espera(600)
    await clicar(page.getByRole("button", { name: "Ver bitolas e qualidades" }).first())
    await espera(1800)
    await rolarAte("text=Também fabricamos", -160, 1500)
  })

  await trecho(
    "contato",
    async () => {
      await rolarAte("#contato", -40, 1400)
    },
    async () => {
      await digitar(page.locator("[id=nome]"), "Construtora Exemplo", 55)
      await digitar(page.locator("[id=mensagem]"), "10 m³ de pinus 2,5 x 30 x 3,00", 45)
    }
  )

  await trecho(
    "login",
    async () => {
      await page.goto(BASE + "/login", { waitUntil: "load" })
      await espera(1200)
    },
    async () => {
      await digitar(page.locator("#email"), "secretaria@madeireira.local", 35)
      await digitar(page.locator("#senha"), "madeira123", 60)
      await clicar(page.getByRole("button", { name: /Entrar no sistema/ }))
      await page.waitForURL("**/sistema", { timeout: 20000 })
    }
  )

  await trecho(
    "painel",
    async () => {
      await page.goto(BASE + "/sistema?periodo=90d", { waitUntil: "load" })
      await espera(400)
    },
    async () => {
      await espera(1800)
      await mover(page.getByText("Faturamento").first(), { pausa: 900 })
      await mover(page.getByText("Rendimento médio").first(), { pausa: 900 })
      await page.mouse.wheel(0, 520)
      await espera(900)
      const grafico = page.locator(".recharts-wrapper").first()
      const b = await grafico.boundingBox()
      if (b) {
        await page.mouse.move(b.x + b.width * 0.62, b.y + b.height * 0.6, { steps: 30 })
        await espera(1500)
        await page.mouse.move(b.x + b.width * 0.78, b.y + b.height * 0.6, { steps: 20 })
      }
    }
  )

  await trecho(
    "entrada",
    async () => {
      await page.goto(BASE + "/sistema/entradas/nova", { waitUntil: "load" })
    },
    async () => {
      await clicar(page.getByRole("radio", { name: "Pinus" }))
      await clicar(page.getByRole("combobox", { name: "Fornecedor" }))
      await clicar(page.getByRole("option").first())
      await rolarAte("text=Escolha como esta carga é comprada.", -160, 900)
      await digitar(page.locator("[aria-label='diametroCm da linha 1']"), "32")
      await digitar(page.locator("[aria-label='comprimentoM da linha 1']"), "2,4")
      await substituir(page.locator("[aria-label='quantidade da linha 1']"), "18")
      await clicar(page.getByRole("button", { name: "Adicionar tora" }))
      await digitar(page.locator("[aria-label='diametroCm da linha 2']"), "26")
      await digitar(page.locator("[aria-label='comprimentoM da linha 2']"), "2,4")
      await substituir(page.locator("[aria-label='quantidade da linha 2']"), "24")
      await mover(page.locator("form aside").getByText("Valor a pagar"), { pausa: 800 })
    }
  )

  await trecho(
    "producao",
    async () => {
      await page.goto(BASE + "/sistema/producao/nova", { waitUntil: "load" })
    },
    async () => {
      await clicar(page.getByRole("radio", { name: "Pinus" }))
      await digitar(page.locator("[id=torasConsumidasM3]"), "1,6")
      await digitar(page.locator("[aria-label='Esp. (cm) da linha 1']"), "1,8")
      await digitar(page.locator("[aria-label='Larg. (cm) da linha 1']"), "9")
      await digitar(page.locator("[aria-label='Compr. (m) da linha 1']"), "1,20")
      await digitar(page.locator("[aria-label='Peças da linha 1']"), "400")
      await mover(page.locator("form aside").getByText("Rendimento da serraria"), { pausa: 600 })
    }
  )

  await trecho(
    "estoque",
    async () => {
      await page.goto(BASE + "/sistema/estoque", { waitUntil: "load" })
    },
    async () => {
      await digitar(page.getByPlaceholder("Buscar medida, ex.: 1,8 x 9"), "1,8 x 9", 110)
      await espera(1500)
      await clicar(page.getByRole("link", { name: /Paletes e caixotes/ }))
      await page.waitForURL("**aba=produtos")
      await espera(1200)
      await mover(page.getByText("Palete PBR").first(), { pausa: 800 })
    }
  )

  await trecho(
    "venda",
    async () => {
      await page.goto(BASE + "/sistema/vendas/nova", { waitUntil: "load" })
    },
    async () => {
      await clicar(page.getByRole("combobox", { name: "Cliente" }))
      await page
        .getByPlaceholder("Digite para buscar…")
        .pressSequentially("horizonte", { delay: 70 })
      await clicar(page.getByRole("option").first())
      await espera(900)
      await rolarAte("text=Itens da carga", -260, 1100)
      await clicar(page.getByRole("combobox", { name: "Item da linha 1" }))
      await page
        .getByPlaceholder("Buscar: pinus, 1,8 x 9, palete…")
        .pressSequentially("2,5 x 30", { delay: 80 })
      await clicar(page.getByRole("option").first())
      await digitar(page.locator("[aria-label='Quantidade da linha 1']"), "120")
      await clicar(page.getByRole("button", { name: "Adicionar item" }))
      await clicar(page.getByRole("combobox", { name: "Item da linha 2" }))
      await page
        .getByPlaceholder("Buscar: pinus, 1,8 x 9, palete…")
        .pressSequentially("palete pbr", { delay: 70 })
      await clicar(page.getByRole("option").first())
      await digitar(page.locator("[aria-label='Quantidade da linha 2']"), "20")
      await mover(page.locator("form aside").getByText("Total da venda"), { pausa: 600 })
    }
  )

  await trecho("romaneio", null, async () => {
    await clicar(page.locator("form aside").getByRole("button", { name: "Salvar e confirmar" }))
    await page.waitForURL(/\/sistema\/vendas\/[0-9a-f-]{36}$/, { timeout: 20000 })
    await espera(1800)
    // abre o PDF do romaneio por cima da página (mesma origem, mantém a sessão)
    await page.evaluate(() => {
      const f = document.createElement("iframe")
      f.src = location.pathname + "/romaneio"
      Object.assign(f.style, {
        position: "fixed",
        inset: "40px 40px 40px 40px",
        width: "calc(100% - 80px)",
        height: "calc(100% - 80px)",
        border: "0",
        borderRadius: "16px",
        boxShadow: "0 30px 80px rgba(0,0,0,.5)",
        zIndex: 2147483000,
        background: "#fff",
      })
      document.body.appendChild(f)
    })
    await espera(5000)
  })

  await trecho(
    "relatorios",
    async () => {
      await page.goto(BASE + "/sistema/relatorios?tipo=vendas&periodo=90d", { waitUntil: "load" })
    },
    async () => {
      await espera(800)
      await mover(page.getByRole("link", { name: "Excel" }), { pausa: 1000 })
      await mover(page.getByRole("link", { name: "PDF" }), { pausa: 1000 })
      await clicar(page.getByRole("link", { name: "Paletes e caixotes" }))
      await espera(1200)
    }
  )

  await trecho(
    "controle",
    async () => {
      await page.goto(BASE + "/sistema/orcamentos", { waitUntil: "load" })
    },
    async () => {
      await clicar(page.locator("li button").first())
      await espera(1200)
      await mover(page.getByRole("link", { name: /Responder no WhatsApp/ }), { pausa: 900 })
      await page.goto(BASE + "/sistema/auditoria", { waitUntil: "load" })
      await legenda("controle")
      await clicar(page.locator("li button").nth(3))
      await espera(1000)
    }
  )

  await trecho(
    "fechamento",
    async () => {
      await page.setContent(
        CARTAO("Serraria Modelo", "Gestão completa, do pátio ao escritório", [
          "Site com orçamento e WhatsApp",
          "Entrada de toras: m³, estéreo ou tonelada",
          "Produção com rendimento automático",
          "Estoque por bitola, qualidade e unidade",
          "Vendas com romaneio em PDF",
          "Painel, relatórios Excel e PDF",
          "Auditoria de todas as alterações",
          "Funciona no computador e no celular",
        ])
      )
      await espera(400)
    },
    async () => {},
    { cartao: true }
  )

  await espera(1500)
  const video = page.video()
  await context.close()
  const caminho = await video.path()
  fs.writeFileSync(
    path.join(out, "linha-do-tempo.json"),
    JSON.stringify({ video: caminho, trechos: linhaDoTempo }, null, 1)
  )
  console.log("vídeo:", caminho)
  await browser.close()
})().catch((e) => {
  console.error("FALHOU:", e.message)
  process.exit(1)
})
