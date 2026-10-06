import "server-only"

import { asc, eq } from "drizzle-orm"

import { clientes, vendas, vendasItens, type Tx } from "@/db"
import { listarEstoque } from "@/lib/consultas/estoque"
import { opcoesCadastros } from "@/lib/consultas/opcoes"
import { formatDocumento, numeroParaCampo } from "@/lib/format"

import type { OpcaoCliente, ValoresVenda } from "./formulario"

export async function dadosFormularioVenda(tx: Tx) {
  const [opcoes, estoque, listaClientes] = await Promise.all([
    opcoesCadastros(tx),
    listarEstoque(tx),
    tx.select().from(clientes).where(eq(clientes.ativo, true)).orderBy(asc(clientes.razaoSocial)),
  ])
  const clientesOpcoes: OpcaoCliente[] = listaClientes.map((c) => ({
    valor: c.id,
    rotulo: c.razaoSocial,
    detalhe: [formatDocumento(c.documento), [c.municipio, c.uf].filter(Boolean).join("/")]
      .filter(Boolean)
      .join(" · "),
    endereco: {
      cep: c.cep,
      logradouro: c.logradouro,
      numero: c.numero,
      complemento: c.complemento,
      bairro: c.bairro,
      municipio: c.municipio,
      codigoIbge: c.codigoIbge,
      uf: c.uf,
    },
  }))
  return {
    clientes: clientesOpcoes,
    motoristas: opcoes.motoristas,
    veiculos: opcoes.veiculos.map((v) => ({
      id: v.id,
      rotulo: v.rotulo,
      tipo: v.tipo,
      motoristaPadraoId: v.motoristaPadraoId,
    })),
    itensEstoque: estoque.map((i) => ({
      id: i.id,
      especie: i.especie,
      qualidade: i.qualidade,
      espessuraCm: i.espessuraCm,
      larguraCm: i.larguraCm,
      comprimentoM: i.comprimentoM,
      saldoPecas: i.saldoPecas,
      precoM3: i.precoM3,
    })),
  }
}

export const VENDA_VAZIA: ValoresVenda = {
  clienteId: "",
  motoristaId: "",
  veiculoId: "",
  placa: "",
  destinoCep: "",
  destinoLogradouro: "",
  destinoNumero: "",
  destinoComplemento: "",
  destinoBairro: "",
  destinoMunicipio: "",
  destinoCodigoIbge: "",
  destinoUf: "",
  tipoFrete: "cif",
  valorFrete: "",
  desconto: "",
  documentoFlorestal: "",
  observacoes: "",
  itens: [{ estoqueItemId: "", quantidade: "", precoM3: "" }],
}

export async function valoresVendaExistente(
  tx: Tx,
  id: string
): Promise<{ status: string; valores: ValoresVenda } | null> {
  const [v] = await tx.select().from(vendas).where(eq(vendas.id, id))
  if (!v) return null
  const itens = await tx
    .select()
    .from(vendasItens)
    .where(eq(vendasItens.vendaId, id))
    .orderBy(asc(vendasItens.createdAt))
  return {
    status: v.status,
    valores: {
      clienteId: v.clienteId,
      motoristaId: v.motoristaId ?? "",
      veiculoId: v.veiculoId ?? "",
      placa: v.placa ?? "",
      destinoCep: v.destinoCep ?? "",
      destinoLogradouro: v.destinoLogradouro ?? "",
      destinoNumero: v.destinoNumero ?? "",
      destinoComplemento: v.destinoComplemento ?? "",
      destinoBairro: v.destinoBairro ?? "",
      destinoMunicipio: v.destinoMunicipio ?? "",
      destinoCodigoIbge: v.destinoCodigoIbge ?? "",
      destinoUf: v.destinoUf ?? "",
      tipoFrete: v.tipoFrete,
      valorFrete: Number(v.valorFrete) ? numeroParaCampo(v.valorFrete) : "",
      desconto: Number(v.desconto) ? numeroParaCampo(v.desconto) : "",
      documentoFlorestal: v.documentoFlorestal ?? "",
      observacoes: v.observacoes ?? "",
      itens: itens.map((i) => ({
        estoqueItemId: i.estoqueItemId,
        quantidade: String(i.quantidade),
        precoM3: numeroParaCampo(i.precoM3),
      })),
    },
  }
}
