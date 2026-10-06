import "server-only"

import { asc, eq } from "drizzle-orm"

import { entradasToras, entradasTorasItens, type Tx } from "@/db"
import { numeroParaCampo } from "@/lib/format"

import type { ValoresEntrada } from "./formulario"

const TORA_VAZIA = { diametroCm: "", comprimentoM: "", quantidade: "1" }

export function valoresNovaEntrada(especieId: string): ValoresEntrada {
  return {
    especieId,
    fornecedorId: "",
    motoristaId: "",
    veiculoId: "",
    placa: "",
    origem: "",
    municipioOrigem: "",
    ufOrigem: "",
    documentoFlorestal: "",
    modoMedicao: "m3",
    cargaComprimentoM: "",
    cargaLarguraM: "",
    cargaAlturaM: "",
    pesoBrutoKg: "",
    taraKg: "",
    toras: [{ ...TORA_VAZIA }],
    valorUnitario: "",
    observacoes: "",
  }
}

export async function valoresEntradaExistente(tx: Tx, id: string): Promise<ValoresEntrada | null> {
  const [e] = await tx.select().from(entradasToras).where(eq(entradasToras.id, id))
  if (!e) return null
  const itens = await tx
    .select()
    .from(entradasTorasItens)
    .where(eq(entradasTorasItens.entradaId, id))
    .orderBy(asc(entradasTorasItens.createdAt))
  return {
    especieId: e.especieId,
    fornecedorId: e.fornecedorId,
    motoristaId: e.motoristaId ?? "",
    veiculoId: e.veiculoId ?? "",
    placa: e.placa ?? "",
    origem: e.origem ?? "",
    municipioOrigem: e.municipioOrigem ?? "",
    ufOrigem: e.ufOrigem ?? "",
    documentoFlorestal: e.documentoFlorestal ?? "",
    modoMedicao: e.modoMedicao,
    cargaComprimentoM: numeroParaCampo(e.cargaComprimentoM),
    cargaLarguraM: numeroParaCampo(e.cargaLarguraM),
    cargaAlturaM: numeroParaCampo(e.cargaAlturaM),
    pesoBrutoKg: numeroParaCampo(e.pesoBrutoKg),
    taraKg: numeroParaCampo(e.taraKg),
    toras: itens.length
      ? itens.map((t) => ({
          diametroCm: numeroParaCampo(t.diametroCm),
          comprimentoM: numeroParaCampo(t.comprimentoM),
          quantidade: String(t.quantidade),
        }))
      : [{ ...TORA_VAZIA }],
    valorUnitario: numeroParaCampo(e.valorUnitario),
    observacoes: e.observacoes ?? "",
  }
}
