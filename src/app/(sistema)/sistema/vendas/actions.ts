"use server"

import { and, eq, inArray } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import {
  clientes,
  comUsuario,
  especies,
  estoqueItens,
  estoqueMov,
  produtos,
  produtosMov,
  qualidades,
  romaneios,
  vendas,
  vendasItens,
  type Tx,
} from "@/db"
import { executar } from "@/lib/acoes"
import { paraNumeric } from "@/lib/calculos"
import { cancelamentoVendaSchema, vendaSchema } from "@/lib/schemas/vendas"
import { calcularVenda, descricaoItem, descricaoProduto } from "@/lib/vendas"

function revalidar(id?: string) {
  revalidatePath("/sistema/vendas")
  revalidatePath("/sistema/estoque")
  revalidatePath("/sistema")
  if (id) revalidatePath(`/sistema/vendas/${id}`)
}

/** Baixa o estoque e gera o romaneio. Só para vendas em rascunho. */
async function confirmar(tx: Tx, vendaId: string, permitirNegativo: boolean) {
  const [v] = await tx
    .update(vendas)
    .set({ status: "confirmada", confirmadaEm: new Date().toISOString() })
    .where(and(eq(vendas.id, vendaId), eq(vendas.status, "rascunho")))
    .returning({ numero: vendas.numero })
  if (!v) throw new Error("Só é possível confirmar uma venda em rascunho.")

  const itens = await tx.select().from(vendasItens).where(eq(vendasItens.vendaId, vendaId))
  for (const item of itens) {
    const mov = {
      tipo: "venda" as const,
      quantidade: -item.quantidade,
      vendaId,
      permitirNegativo,
      observacao: `Venda nº ${v.numero}`,
    }
    if (item.produtoId) await tx.insert(produtosMov).values({ ...mov, produtoId: item.produtoId })
    else await tx.insert(estoqueMov).values({ ...mov, estoqueItemId: item.estoqueItemId! })
  }
  const [r] = await tx.insert(romaneios).values({ vendaId }).returning({ numero: romaneios.numero })
  return r!.numero
}

export async function salvarVenda(
  id: string | null,
  entrada: unknown,
  opcoes: { confirmar: boolean; permitirNegativo: boolean }
) {
  return executar(async () => {
    const d = vendaSchema.parse(entrada)

    const resultado = await comUsuario(async (tx) => {
      // dados atuais dos itens (medidas, espécie, qualidade, produto) — nunca confiamos no navegador
      const idsM3 = d.itens.filter((i) => i.tipo === "M3").map((i) => i.itemId)
      const idsUN = d.itens.filter((i) => i.tipo === "UN").map((i) => i.itemId)
      const [infoM3, infoUN] = await Promise.all([
        idsM3.length
          ? tx
              .select({
                id: estoqueItens.id,
                especie: especies.nome,
                qualidade: qualidades.nome,
                espessuraCm: estoqueItens.espessuraCm,
                larguraCm: estoqueItens.larguraCm,
                comprimentoM: estoqueItens.comprimentoM,
              })
              .from(estoqueItens)
              .innerJoin(especies, eq(especies.id, estoqueItens.especieId))
              .innerJoin(qualidades, eq(qualidades.id, estoqueItens.qualidadeId))
              .where(inArray(estoqueItens.id, idsM3))
          : [],
        idsUN.length
          ? tx
              .select({ id: produtos.id, nome: produtos.nome, dimensoes: produtos.dimensoes })
              .from(produtos)
              .where(inArray(produtos.id, idsUN))
          : [],
      ])
      const m3 = new Map(infoM3.map((i) => [i.id, i]))
      const un = new Map(infoUN.map((i) => [i.id, i]))
      const itens = d.itens.map((i) => {
        if (i.tipo === "UN") {
          const p = un.get(i.itemId)
          if (!p) throw new Error("Um dos produtos não existe mais.")
          return { ...i, unidade: "UN" as const, descricao: descricaoProduto(p) }
        }
        const e = m3.get(i.itemId)
        if (!e) throw new Error("Um dos itens não existe mais no estoque.")
        return { ...i, ...e, unidade: "M3" as const, descricao: descricaoItem(e) }
      })
      const calc = calcularVenda(itens, d.valorFrete, d.desconto)
      if (calc.valorTotal <= 0 && calc.totalM3 <= 0 && calc.totalUnidades <= 0)
        throw new Error("A venda está vazia.")

      const valores = {
        clienteId: d.clienteId,
        motoristaId: d.motoristaId,
        veiculoId: d.veiculoId,
        placa: d.placa,
        destinoCep: d.destinoCep,
        destinoLogradouro: d.destinoLogradouro,
        destinoNumero: d.destinoNumero,
        destinoComplemento: d.destinoComplemento,
        destinoBairro: d.destinoBairro,
        destinoMunicipio: d.destinoMunicipio,
        destinoCodigoIbge: d.destinoCodigoIbge,
        destinoUf: d.destinoUf,
        tipoFrete: d.tipoFrete,
        valorFrete: paraNumeric(d.valorFrete, 2),
        desconto: paraNumeric(d.desconto, 2),
        documentoFlorestal: d.documentoFlorestal,
        observacoes: d.observacoes,
        totalPecas: calc.totalPecas,
        totalUnidades: calc.totalUnidades,
        totalM3: paraNumeric(calc.totalM3, 6),
        valorProdutos: paraNumeric(calc.valorProdutos, 2),
        valorTotal: paraNumeric(calc.valorTotal, 2),
      }

      let vendaId: string
      if (id) {
        const [r] = await tx
          .update(vendas)
          .set(valores)
          .where(and(eq(vendas.id, id), eq(vendas.status, "rascunho")))
          .returning({ id: vendas.id })
        if (!r) throw new Error("Só vendas em rascunho podem ser editadas.")
        vendaId = r.id
        await tx.delete(vendasItens).where(eq(vendasItens.vendaId, vendaId))
      } else {
        const [r] = await tx.insert(vendas).values(valores).returning({ id: vendas.id })
        vendaId = r!.id
      }

      await tx.insert(vendasItens).values(
        itens.map((i, k) => ({
          vendaId,
          unidade: i.unidade,
          estoqueItemId: i.unidade === "M3" ? i.itemId : null,
          produtoId: i.unidade === "UN" ? i.itemId : null,
          descricao: i.descricao,
          quantidade: i.quantidade,
          volumeM3: paraNumeric(calc.linhas[k]!.volumeM3, 6),
          precoM3: i.unidade === "M3" ? paraNumeric(i.preco, 2) : null,
          precoUnitario: i.unidade === "UN" ? paraNumeric(i.preco, 2) : null,
          valorTotal: paraNumeric(calc.linhas[k]!.valor, 2),
        }))
      )

      const romaneio = opcoes.confirmar
        ? await confirmar(tx, vendaId, opcoes.permitirNegativo)
        : null
      return { id: vendaId, romaneio }
    })

    revalidar(resultado.id)
    return resultado
  })
}

export async function confirmarVenda(id: string, permitirNegativo: boolean) {
  return executar(async () => {
    const romaneio = await comUsuario((tx) => confirmar(tx, id, permitirNegativo))
    revalidar(id)
    return { romaneio }
  })
}

export async function cancelarVenda(id: string, entrada: unknown) {
  return executar(async () => {
    const { motivo } = cancelamentoVendaSchema.parse(entrada)
    await comUsuario(async (tx) => {
      const [atual] = await tx
        .select({ status: vendas.status, numero: vendas.numero })
        .from(vendas)
        .where(eq(vendas.id, id))
      if (!atual) throw new Error("Venda não encontrada.")
      if (atual.status === "nfe_emitida" || atual.status === "entregue") {
        throw new Error("Venda com NF-e emitida ou entregue: cancele a NF-e primeiro.")
      }
      if (atual.status === "cancelada") throw new Error("Esta venda já está cancelada.")

      if (atual.status === "confirmada") {
        const itens = await tx.select().from(vendasItens).where(eq(vendasItens.vendaId, id))
        for (const item of itens) {
          const mov = {
            tipo: "estorno_venda" as const,
            quantidade: item.quantidade,
            vendaId: id,
            observacao: `Cancelamento da venda nº ${atual.numero}: ${motivo}`,
          }
          if (item.produtoId)
            await tx.insert(produtosMov).values({ ...mov, produtoId: item.produtoId })
          else await tx.insert(estoqueMov).values({ ...mov, estoqueItemId: item.estoqueItemId! })
        }
      }
      await tx
        .update(vendas)
        .set({
          status: "cancelada",
          canceladaEm: new Date().toISOString(),
          motivoCancelamento: motivo,
        })
        .where(eq(vendas.id, id))
    })
    revalidar(id)
  })
}

export async function marcarEntregue(id: string) {
  return executar(async () => {
    await comUsuario(async (tx) => {
      const [r] = await tx
        .update(vendas)
        .set({ status: "entregue", entregueEm: new Date().toISOString() })
        .where(and(eq(vendas.id, id), inArray(vendas.status, ["confirmada", "nfe_emitida"])))
        .returning({ id: vendas.id })
      if (!r) throw new Error("Só vendas confirmadas podem ser marcadas como entregues.")
    })
    revalidar(id)
  })
}

export async function excluirRascunho(id: string) {
  return executar(async () => {
    await comUsuario(async (tx) => {
      const [r] = await tx
        .delete(vendas)
        .where(and(eq(vendas.id, id), eq(vendas.status, "rascunho")))
        .returning({ id: vendas.id })
      if (!r)
        throw new Error("Só rascunhos podem ser excluídos. Para vendas confirmadas, use Cancelar.")
    })
    revalidar()
  })
}

/** Endereço do cliente para pré-preencher o destino. */
export async function enderecoCliente(clienteId: string) {
  return executar(async () => {
    const [c] = await comUsuario((tx) =>
      tx
        .select({
          cep: clientes.cep,
          logradouro: clientes.logradouro,
          numero: clientes.numero,
          complemento: clientes.complemento,
          bairro: clientes.bairro,
          municipio: clientes.municipio,
          codigoIbge: clientes.codigoIbge,
          uf: clientes.uf,
        })
        .from(clientes)
        .where(eq(clientes.id, clienteId))
    )
    return c ?? null
  })
}
