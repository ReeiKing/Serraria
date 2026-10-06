import "server-only"

import { asc, eq } from "drizzle-orm"

import { clientes, produtos, vendas, vendasItens, type Tx } from "@/db"
import { opcaoMadeira, type OpcaoItemVenda } from "@/lib/itens-venda"
import { listarEstoque } from "@/lib/consultas/estoque"
import { opcoesCadastros } from "@/lib/consultas/opcoes"
import { formatDocumento, numeroParaCampo } from "@/lib/format"

import type { OpcaoCliente, ValoresVenda } from "./formulario"

export async function dadosFormularioVenda(tx: Tx) {
  const [opcoes, estoque, listaClientes, listaProdutos] = await Promise.all([
    opcoesCadastros(tx),
    listarEstoque(tx),
    tx.select().from(clientes).where(eq(clientes.ativo, true)).orderBy(asc(clientes.razaoSocial)),
    tx.select().from(produtos).where(eq(produtos.ativo, true)).orderBy(asc(produtos.nome)),
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
    itensVenda: [
      ...estoque.map(opcaoMadeira),
      ...listaProdutos.map((p): OpcaoItemVenda => ({
        tipo: "UN",
        id: p.id,
        rotulo: p.dimensoes ? `${p.nome} · ${p.dimensoes}` : p.nome,
        busca: `${p.nome} ${p.categoria} ${p.dimensoes ?? ""}`,
        saldo: p.saldoUnidades,
        preco: p.precoVenda,
      })),
    ],
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
  itens: [{ tipo: "M3", itemId: "", quantidade: "", preco: "" }],
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
        tipo: i.unidade === "UN" ? ("UN" as const) : ("M3" as const),
        itemId: (i.unidade === "UN" ? i.produtoId : i.estoqueItemId) ?? "",
        quantidade: String(i.quantidade),
        preco: numeroParaCampo(i.unidade === "UN" ? i.precoUnitario : i.precoM3),
      })),
    },
  }
}
