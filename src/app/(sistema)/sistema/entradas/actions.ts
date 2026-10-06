"use server"

import { and, eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import {
  comUsuario,
  entradasToras,
  entradasTorasItens,
  entradasTorasPagamentos,
  estoqueTorasMov,
  type Tx,
} from "@/db"
import { executar } from "@/lib/acoes"
import { paraNumeric } from "@/lib/calculos"
import { calcularEntrada } from "@/lib/entradas"
import { entradaToraSchema, pagamentoSchema } from "@/lib/schemas/entradas"

const CAMINHO = "/sistema/entradas"

/** Recalcula status de pagamento quando o valor total da entrada muda. */
async function atualizarStatusPagamento(tx: Tx, entradaId: string) {
  await tx.execute(sql`
    update public.entradas_toras
       set status_pagamento = case
             when valor_pago <= 0 then 'pendente'
             when valor_pago >= valor_total then 'pago'
             else 'parcial' end::public.status_pagamento
     where id = ${entradaId}`)
}

export async function salvarEntrada(id: string | null, entrada: unknown) {
  return executar(async () => {
    const d = entradaToraSchema.parse(entrada)
    const c = calcularEntrada(d)
    if (c.quantidade <= 0)
      throw new Error("A quantidade calculada ficou zerada. Confira as medidas.")

    const valores = {
      especieId: d.especieId,
      fornecedorId: d.fornecedorId,
      motoristaId: d.motoristaId,
      veiculoId: d.veiculoId,
      placa: d.placa,
      origem: d.origem,
      municipioOrigem: d.municipioOrigem,
      ufOrigem: d.ufOrigem,
      documentoFlorestal: d.documentoFlorestal,
      modoMedicao: d.modoMedicao,
      cargaComprimentoM: d.modoMedicao === "estereo" ? paraNumeric(d.cargaComprimentoM!, 3) : null,
      cargaLarguraM: d.modoMedicao === "estereo" ? paraNumeric(d.cargaLarguraM!, 3) : null,
      cargaAlturaM: d.modoMedicao === "estereo" ? paraNumeric(d.cargaAlturaM!, 3) : null,
      pesoBrutoKg: d.modoMedicao === "tonelada" ? paraNumeric(d.pesoBrutoKg!, 2) : null,
      taraKg: d.modoMedicao === "tonelada" ? paraNumeric(d.taraKg!, 2) : null,
      pesoLiquidoKg: c.pesoLiquidoKg !== null ? paraNumeric(c.pesoLiquidoKg, 2) : null,
      quantidade: paraNumeric(c.quantidade, 6),
      unidade: c.unidade,
      valorUnitario: paraNumeric(d.valorUnitario, 2),
      valorTotal: paraNumeric(c.valorTotal, 2),
      observacoes: d.observacoes,
    }

    const entradaId = await comUsuario(async (tx) => {
      let eid: string
      if (id) {
        const [r] = await tx
          .update(entradasToras)
          .set(valores)
          .where(eq(entradasToras.id, id))
          .returning({ id: entradasToras.id })
        if (!r) throw new Error("Entrada não encontrada.")
        eid = r.id
        await tx.delete(entradasTorasItens).where(eq(entradasTorasItens.entradaId, eid))
        await tx
          .delete(estoqueTorasMov)
          .where(and(eq(estoqueTorasMov.entradaId, eid), eq(estoqueTorasMov.tipo, "compra")))
      } else {
        const [r] = await tx
          .insert(entradasToras)
          .values(valores)
          .returning({ id: entradasToras.id })
        eid = r!.id
      }

      if (c.toras.length) {
        await tx.insert(entradasTorasItens).values(
          c.toras.map((t) => ({
            entradaId: eid,
            diametroCm: paraNumeric(t.diametroCm, 2),
            comprimentoM: paraNumeric(t.comprimentoM, 3),
            quantidade: t.quantidade,
            volumeM3: paraNumeric(t.volumeM3, 6),
          }))
        )
      }

      // Alimenta o estoque de toras na unidade em que foi comprado.
      await tx.insert(estoqueTorasMov).values({
        especieId: d.especieId,
        tipo: "compra",
        quantidade: paraNumeric(c.quantidade, 6),
        unidade: c.unidade,
        entradaId: eid,
      })

      if (id) await atualizarStatusPagamento(tx, eid)
      return eid
    })

    revalidatePath(CAMINHO)
    revalidatePath("/sistema")
    return { id: entradaId }
  })
}

export async function excluirEntrada(id: string) {
  return executar(async () => {
    await comUsuario((tx) => tx.delete(entradasToras).where(eq(entradasToras.id, id)))
    revalidatePath(CAMINHO)
    revalidatePath("/sistema")
  })
}

export async function registrarPagamento(entradaId: string, entrada: unknown) {
  return executar(async () => {
    const d = pagamentoSchema.parse(entrada)
    await comUsuario(async (tx) => {
      const [e] = await tx
        .select({ total: entradasToras.valorTotal, pago: entradasToras.valorPago })
        .from(entradasToras)
        .where(eq(entradasToras.id, entradaId))
      if (!e) throw new Error("Entrada não encontrada.")
      const restante = Number(e.total) - Number(e.pago)
      if (d.valor > restante + 0.001) {
        throw new Error(
          `O valor passa do saldo a pagar (restam ${restante.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}).`
        )
      }
      await tx.insert(entradasTorasPagamentos).values({
        entradaId,
        dataPagamento: d.dataPagamento,
        valor: paraNumeric(d.valor, 2),
        forma: d.forma,
        observacao: d.observacao,
      })
    })
    revalidatePath(`${CAMINHO}/${entradaId}`)
    revalidatePath(CAMINHO)
  })
}

export async function excluirPagamento(pagamentoId: string, entradaId: string) {
  return executar(async () => {
    await comUsuario((tx) =>
      tx.delete(entradasTorasPagamentos).where(eq(entradasTorasPagamentos.id, pagamentoId))
    )
    revalidatePath(`${CAMINHO}/${entradaId}`)
    revalidatePath(CAMINHO)
  })
}
