import "server-only"

import { asc, desc, eq } from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"

import {
  clientes,
  empresas,
  especies,
  estoqueItens,
  motoristas,
  notasFiscais,
  qualidades,
  romaneios,
  usuarios,
  veiculos,
  vendas,
  vendasItens,
  type Tx,
} from "@/db"

/** Tudo o que a tela de detalhe e o romaneio precisam de uma venda. */
export async function carregarVenda(tx: Tx, id: string) {
  const criador = alias(usuarios, "criador")
  const [linha] = await tx
    .select({
      venda: vendas,
      cliente: clientes,
      motorista: motoristas,
      veiculo: veiculos,
      romaneio: romaneios,
      criadoPor: criador.nome,
    })
    .from(vendas)
    .innerJoin(clientes, eq(clientes.id, vendas.clienteId))
    .leftJoin(motoristas, eq(motoristas.id, vendas.motoristaId))
    .leftJoin(veiculos, eq(veiculos.id, vendas.veiculoId))
    .leftJoin(romaneios, eq(romaneios.vendaId, vendas.id))
    .leftJoin(criador, eq(criador.id, vendas.createdBy))
    .where(eq(vendas.id, id))
  if (!linha) return null

  const [itens, [empresa], notas] = await Promise.all([
    tx
      .select({
        id: vendasItens.id,
        estoqueItemId: vendasItens.estoqueItemId,
        descricao: vendasItens.descricao,
        quantidade: vendasItens.quantidade,
        volumeM3: vendasItens.volumeM3,
        precoM3: vendasItens.precoM3,
        valorTotal: vendasItens.valorTotal,
        especie: especies.nome,
        qualidade: qualidades.nome,
        espessuraCm: estoqueItens.espessuraCm,
        larguraCm: estoqueItens.larguraCm,
        comprimentoM: estoqueItens.comprimentoM,
      })
      .from(vendasItens)
      .innerJoin(estoqueItens, eq(estoqueItens.id, vendasItens.estoqueItemId))
      .innerJoin(especies, eq(especies.id, estoqueItens.especieId))
      .innerJoin(qualidades, eq(qualidades.id, estoqueItens.qualidadeId))
      .where(eq(vendasItens.vendaId, id))
      .orderBy(asc(vendasItens.createdAt)),
    tx.select().from(empresas).limit(1),
    tx
      .select()
      .from(notasFiscais)
      .where(eq(notasFiscais.vendaId, id))
      .orderBy(desc(notasFiscais.createdAt)),
  ])

  return {
    ...linha,
    itens,
    empresa: empresa ?? null,
    notas,
    notaAutorizada: notas.find((n) => n.status === "autorizada") ?? null,
  }
}

export type VendaCompleta = NonNullable<Awaited<ReturnType<typeof carregarVenda>>>
