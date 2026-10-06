import "server-only"

import { asc, eq } from "drizzle-orm"

import { especies, fornecedores, motoristas, qualidades, veiculos, type Tx } from "@/db"
import { formatDocumento, formatPlaca } from "@/lib/format"

/** Listas para selects dos formulários (só cadastros ativos). */
export async function opcoesCadastros(tx: Tx) {
  const [esp, forn, mot, vei, qual] = await Promise.all([
    tx
      .select({ id: especies.id, nome: especies.nome })
      .from(especies)
      .where(eq(especies.ativo, true))
      .orderBy(asc(especies.nome)),
    tx
      .select({
        id: fornecedores.id,
        nome: fornecedores.nome,
        documento: fornecedores.documento,
        municipio: fornecedores.municipio,
        uf: fornecedores.uf,
      })
      .from(fornecedores)
      .where(eq(fornecedores.ativo, true))
      .orderBy(asc(fornecedores.nome)),
    tx
      .select({ id: motoristas.id, nome: motoristas.nome })
      .from(motoristas)
      .where(eq(motoristas.ativo, true))
      .orderBy(asc(motoristas.nome)),
    tx
      .select({
        id: veiculos.id,
        placa: veiculos.placa,
        tipo: veiculos.tipo,
        taraKg: veiculos.taraKg,
        motoristaPadraoId: veiculos.motoristaPadraoId,
      })
      .from(veiculos)
      .where(eq(veiculos.ativo, true))
      .orderBy(asc(veiculos.placa)),
    tx
      .select({ id: qualidades.id, nome: qualidades.nome })
      .from(qualidades)
      .where(eq(qualidades.ativo, true))
      .orderBy(asc(qualidades.ordem)),
  ])
  return {
    especies: esp,
    qualidades: qual,
    fornecedores: forn.map((f) => ({
      valor: f.id,
      rotulo: f.nome,
      detalhe: [formatDocumento(f.documento), [f.municipio, f.uf].filter(Boolean).join("/")]
        .filter(Boolean)
        .join(" · "),
    })),
    motoristas: mot.map((m) => ({ valor: m.id, rotulo: m.nome })),
    veiculos: vei.map((v) => ({ ...v, rotulo: formatPlaca(v.placa) })),
  }
}

export type OpcoesCadastros = Awaited<ReturnType<typeof opcoesCadastros>>
