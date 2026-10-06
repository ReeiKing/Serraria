// ARQUIVO GERADO por `npm run db:pull` — não edite à mão.
// Fonte da verdade: supabase/migrations/*.sql
import { relations } from "drizzle-orm/relations"
import {
  usersInAuth,
  producoes,
  especies,
  usuarios,
  empresas,
  fornecedores,
  clientes,
  motoristas,
  veiculos,
  qualidades,
  tabelaPrecos,
  entradasToras,
  entradasTorasItens,
  entradasTorasPagamentos,
  estoqueTorasMov,
  estoqueItens,
  estoqueMov,
  vendas,
  producoesItens,
  vendasItens,
  romaneios,
  notasFiscais,
  nfeEventos,
  nfeLogs,
  orcamentosSite,
  auditoria,
} from "./schema"

export const producoesRelations = relations(producoes, ({ one, many }) => ({
  usersInAuth_createdBy: one(usersInAuth, {
    fields: [producoes.createdBy],
    references: [usersInAuth.id],
    relationName: "producoes_createdBy_usersInAuth_id",
  }),
  especy: one(especies, {
    fields: [producoes.especieId],
    references: [especies.id],
  }),
  usersInAuth_updatedBy: one(usersInAuth, {
    fields: [producoes.updatedBy],
    references: [usersInAuth.id],
    relationName: "producoes_updatedBy_usersInAuth_id",
  }),
  estoqueTorasMovs: many(estoqueTorasMov),
  estoqueMovs: many(estoqueMov),
  producoesItens: many(producoesItens),
}))

export const usersInAuthRelations = relations(usersInAuth, ({ many }) => ({
  producoes_createdBy: many(producoes, {
    relationName: "producoes_createdBy_usersInAuth_id",
  }),
  producoes_updatedBy: many(producoes, {
    relationName: "producoes_updatedBy_usersInAuth_id",
  }),
  usuarios_createdBy: many(usuarios, {
    relationName: "usuarios_createdBy_usersInAuth_id",
  }),
  usuarios_id: many(usuarios, {
    relationName: "usuarios_id_usersInAuth_id",
  }),
  usuarios_updatedBy: many(usuarios, {
    relationName: "usuarios_updatedBy_usersInAuth_id",
  }),
  empresas_createdBy: many(empresas, {
    relationName: "empresas_createdBy_usersInAuth_id",
  }),
  empresas_updatedBy: many(empresas, {
    relationName: "empresas_updatedBy_usersInAuth_id",
  }),
  fornecedores_createdBy: many(fornecedores, {
    relationName: "fornecedores_createdBy_usersInAuth_id",
  }),
  fornecedores_updatedBy: many(fornecedores, {
    relationName: "fornecedores_updatedBy_usersInAuth_id",
  }),
  clientes_createdBy: many(clientes, {
    relationName: "clientes_createdBy_usersInAuth_id",
  }),
  clientes_updatedBy: many(clientes, {
    relationName: "clientes_updatedBy_usersInAuth_id",
  }),
  motoristas_createdBy: many(motoristas, {
    relationName: "motoristas_createdBy_usersInAuth_id",
  }),
  motoristas_updatedBy: many(motoristas, {
    relationName: "motoristas_updatedBy_usersInAuth_id",
  }),
  veiculos_createdBy: many(veiculos, {
    relationName: "veiculos_createdBy_usersInAuth_id",
  }),
  veiculos_updatedBy: many(veiculos, {
    relationName: "veiculos_updatedBy_usersInAuth_id",
  }),
  qualidades_createdBy: many(qualidades, {
    relationName: "qualidades_createdBy_usersInAuth_id",
  }),
  qualidades_updatedBy: many(qualidades, {
    relationName: "qualidades_updatedBy_usersInAuth_id",
  }),
  tabelaPrecos_createdBy: many(tabelaPrecos, {
    relationName: "tabelaPrecos_createdBy_usersInAuth_id",
  }),
  tabelaPrecos_updatedBy: many(tabelaPrecos, {
    relationName: "tabelaPrecos_updatedBy_usersInAuth_id",
  }),
  entradasToras_createdBy: many(entradasToras, {
    relationName: "entradasToras_createdBy_usersInAuth_id",
  }),
  entradasToras_updatedBy: many(entradasToras, {
    relationName: "entradasToras_updatedBy_usersInAuth_id",
  }),
  entradasTorasItens_createdBy: many(entradasTorasItens, {
    relationName: "entradasTorasItens_createdBy_usersInAuth_id",
  }),
  entradasTorasItens_updatedBy: many(entradasTorasItens, {
    relationName: "entradasTorasItens_updatedBy_usersInAuth_id",
  }),
  entradasTorasPagamentos_createdBy: many(entradasTorasPagamentos, {
    relationName: "entradasTorasPagamentos_createdBy_usersInAuth_id",
  }),
  entradasTorasPagamentos_updatedBy: many(entradasTorasPagamentos, {
    relationName: "entradasTorasPagamentos_updatedBy_usersInAuth_id",
  }),
  estoqueTorasMovs_createdBy: many(estoqueTorasMov, {
    relationName: "estoqueTorasMov_createdBy_usersInAuth_id",
  }),
  estoqueTorasMovs_updatedBy: many(estoqueTorasMov, {
    relationName: "estoqueTorasMov_updatedBy_usersInAuth_id",
  }),
  estoqueItens_createdBy: many(estoqueItens, {
    relationName: "estoqueItens_createdBy_usersInAuth_id",
  }),
  estoqueItens_updatedBy: many(estoqueItens, {
    relationName: "estoqueItens_updatedBy_usersInAuth_id",
  }),
  estoqueMovs_createdBy: many(estoqueMov, {
    relationName: "estoqueMov_createdBy_usersInAuth_id",
  }),
  estoqueMovs_updatedBy: many(estoqueMov, {
    relationName: "estoqueMov_updatedBy_usersInAuth_id",
  }),
  producoesItens_createdBy: many(producoesItens, {
    relationName: "producoesItens_createdBy_usersInAuth_id",
  }),
  producoesItens_updatedBy: many(producoesItens, {
    relationName: "producoesItens_updatedBy_usersInAuth_id",
  }),
  vendasItens_createdBy: many(vendasItens, {
    relationName: "vendasItens_createdBy_usersInAuth_id",
  }),
  vendasItens_updatedBy: many(vendasItens, {
    relationName: "vendasItens_updatedBy_usersInAuth_id",
  }),
  romaneios_createdBy: many(romaneios, {
    relationName: "romaneios_createdBy_usersInAuth_id",
  }),
  romaneios_updatedBy: many(romaneios, {
    relationName: "romaneios_updatedBy_usersInAuth_id",
  }),
  notasFiscais_createdBy: many(notasFiscais, {
    relationName: "notasFiscais_createdBy_usersInAuth_id",
  }),
  notasFiscais_updatedBy: many(notasFiscais, {
    relationName: "notasFiscais_updatedBy_usersInAuth_id",
  }),
  nfeEventos_createdBy: many(nfeEventos, {
    relationName: "nfeEventos_createdBy_usersInAuth_id",
  }),
  nfeEventos_updatedBy: many(nfeEventos, {
    relationName: "nfeEventos_updatedBy_usersInAuth_id",
  }),
  nfeLogs_createdBy: many(nfeLogs, {
    relationName: "nfeLogs_createdBy_usersInAuth_id",
  }),
  nfeLogs_updatedBy: many(nfeLogs, {
    relationName: "nfeLogs_updatedBy_usersInAuth_id",
  }),
  orcamentosSites_createdBy: many(orcamentosSite, {
    relationName: "orcamentosSite_createdBy_usersInAuth_id",
  }),
  orcamentosSites_updatedBy: many(orcamentosSite, {
    relationName: "orcamentosSite_updatedBy_usersInAuth_id",
  }),
  auditorias: many(auditoria),
  vendas_createdBy: many(vendas, {
    relationName: "vendas_createdBy_usersInAuth_id",
  }),
  vendas_updatedBy: many(vendas, {
    relationName: "vendas_updatedBy_usersInAuth_id",
  }),
  especies_createdBy: many(especies, {
    relationName: "especies_createdBy_usersInAuth_id",
  }),
  especies_updatedBy: many(especies, {
    relationName: "especies_updatedBy_usersInAuth_id",
  }),
}))

export const especiesRelations = relations(especies, ({ one, many }) => ({
  producoes: many(producoes),
  tabelaPrecos: many(tabelaPrecos),
  entradasToras: many(entradasToras),
  estoqueTorasMovs: many(estoqueTorasMov),
  estoqueItens: many(estoqueItens),
  usersInAuth_createdBy: one(usersInAuth, {
    fields: [especies.createdBy],
    references: [usersInAuth.id],
    relationName: "especies_createdBy_usersInAuth_id",
  }),
  usersInAuth_updatedBy: one(usersInAuth, {
    fields: [especies.updatedBy],
    references: [usersInAuth.id],
    relationName: "especies_updatedBy_usersInAuth_id",
  }),
}))

export const usuariosRelations = relations(usuarios, ({ one }) => ({
  usersInAuth_createdBy: one(usersInAuth, {
    fields: [usuarios.createdBy],
    references: [usersInAuth.id],
    relationName: "usuarios_createdBy_usersInAuth_id",
  }),
  usersInAuth_id: one(usersInAuth, {
    fields: [usuarios.id],
    references: [usersInAuth.id],
    relationName: "usuarios_id_usersInAuth_id",
  }),
  usersInAuth_updatedBy: one(usersInAuth, {
    fields: [usuarios.updatedBy],
    references: [usersInAuth.id],
    relationName: "usuarios_updatedBy_usersInAuth_id",
  }),
}))

export const empresasRelations = relations(empresas, ({ one }) => ({
  usersInAuth_createdBy: one(usersInAuth, {
    fields: [empresas.createdBy],
    references: [usersInAuth.id],
    relationName: "empresas_createdBy_usersInAuth_id",
  }),
  usersInAuth_updatedBy: one(usersInAuth, {
    fields: [empresas.updatedBy],
    references: [usersInAuth.id],
    relationName: "empresas_updatedBy_usersInAuth_id",
  }),
}))

export const fornecedoresRelations = relations(fornecedores, ({ one, many }) => ({
  usersInAuth_createdBy: one(usersInAuth, {
    fields: [fornecedores.createdBy],
    references: [usersInAuth.id],
    relationName: "fornecedores_createdBy_usersInAuth_id",
  }),
  usersInAuth_updatedBy: one(usersInAuth, {
    fields: [fornecedores.updatedBy],
    references: [usersInAuth.id],
    relationName: "fornecedores_updatedBy_usersInAuth_id",
  }),
  entradasToras: many(entradasToras),
}))

export const clientesRelations = relations(clientes, ({ one, many }) => ({
  usersInAuth_createdBy: one(usersInAuth, {
    fields: [clientes.createdBy],
    references: [usersInAuth.id],
    relationName: "clientes_createdBy_usersInAuth_id",
  }),
  usersInAuth_updatedBy: one(usersInAuth, {
    fields: [clientes.updatedBy],
    references: [usersInAuth.id],
    relationName: "clientes_updatedBy_usersInAuth_id",
  }),
  vendas: many(vendas),
}))

export const motoristasRelations = relations(motoristas, ({ one, many }) => ({
  usersInAuth_createdBy: one(usersInAuth, {
    fields: [motoristas.createdBy],
    references: [usersInAuth.id],
    relationName: "motoristas_createdBy_usersInAuth_id",
  }),
  usersInAuth_updatedBy: one(usersInAuth, {
    fields: [motoristas.updatedBy],
    references: [usersInAuth.id],
    relationName: "motoristas_updatedBy_usersInAuth_id",
  }),
  veiculos: many(veiculos),
  entradasToras: many(entradasToras),
  vendas: many(vendas),
}))

export const veiculosRelations = relations(veiculos, ({ one, many }) => ({
  usersInAuth_createdBy: one(usersInAuth, {
    fields: [veiculos.createdBy],
    references: [usersInAuth.id],
    relationName: "veiculos_createdBy_usersInAuth_id",
  }),
  motorista: one(motoristas, {
    fields: [veiculos.motoristaPadraoId],
    references: [motoristas.id],
  }),
  usersInAuth_updatedBy: one(usersInAuth, {
    fields: [veiculos.updatedBy],
    references: [usersInAuth.id],
    relationName: "veiculos_updatedBy_usersInAuth_id",
  }),
  entradasToras: many(entradasToras),
  vendas: many(vendas),
}))

export const qualidadesRelations = relations(qualidades, ({ one, many }) => ({
  usersInAuth_createdBy: one(usersInAuth, {
    fields: [qualidades.createdBy],
    references: [usersInAuth.id],
    relationName: "qualidades_createdBy_usersInAuth_id",
  }),
  usersInAuth_updatedBy: one(usersInAuth, {
    fields: [qualidades.updatedBy],
    references: [usersInAuth.id],
    relationName: "qualidades_updatedBy_usersInAuth_id",
  }),
  tabelaPrecos: many(tabelaPrecos),
  estoqueItens: many(estoqueItens),
}))

export const tabelaPrecosRelations = relations(tabelaPrecos, ({ one }) => ({
  usersInAuth_createdBy: one(usersInAuth, {
    fields: [tabelaPrecos.createdBy],
    references: [usersInAuth.id],
    relationName: "tabelaPrecos_createdBy_usersInAuth_id",
  }),
  especy: one(especies, {
    fields: [tabelaPrecos.especieId],
    references: [especies.id],
  }),
  qualidade: one(qualidades, {
    fields: [tabelaPrecos.qualidadeId],
    references: [qualidades.id],
  }),
  usersInAuth_updatedBy: one(usersInAuth, {
    fields: [tabelaPrecos.updatedBy],
    references: [usersInAuth.id],
    relationName: "tabelaPrecos_updatedBy_usersInAuth_id",
  }),
}))

export const entradasTorasRelations = relations(entradasToras, ({ one, many }) => ({
  usersInAuth_createdBy: one(usersInAuth, {
    fields: [entradasToras.createdBy],
    references: [usersInAuth.id],
    relationName: "entradasToras_createdBy_usersInAuth_id",
  }),
  especy: one(especies, {
    fields: [entradasToras.especieId],
    references: [especies.id],
  }),
  fornecedore: one(fornecedores, {
    fields: [entradasToras.fornecedorId],
    references: [fornecedores.id],
  }),
  motorista: one(motoristas, {
    fields: [entradasToras.motoristaId],
    references: [motoristas.id],
  }),
  usersInAuth_updatedBy: one(usersInAuth, {
    fields: [entradasToras.updatedBy],
    references: [usersInAuth.id],
    relationName: "entradasToras_updatedBy_usersInAuth_id",
  }),
  veiculo: one(veiculos, {
    fields: [entradasToras.veiculoId],
    references: [veiculos.id],
  }),
  entradasTorasItens: many(entradasTorasItens),
  entradasTorasPagamentos: many(entradasTorasPagamentos),
  estoqueTorasMovs: many(estoqueTorasMov),
}))

export const entradasTorasItensRelations = relations(entradasTorasItens, ({ one }) => ({
  usersInAuth_createdBy: one(usersInAuth, {
    fields: [entradasTorasItens.createdBy],
    references: [usersInAuth.id],
    relationName: "entradasTorasItens_createdBy_usersInAuth_id",
  }),
  entradasTora: one(entradasToras, {
    fields: [entradasTorasItens.entradaId],
    references: [entradasToras.id],
  }),
  usersInAuth_updatedBy: one(usersInAuth, {
    fields: [entradasTorasItens.updatedBy],
    references: [usersInAuth.id],
    relationName: "entradasTorasItens_updatedBy_usersInAuth_id",
  }),
}))

export const entradasTorasPagamentosRelations = relations(entradasTorasPagamentos, ({ one }) => ({
  usersInAuth_createdBy: one(usersInAuth, {
    fields: [entradasTorasPagamentos.createdBy],
    references: [usersInAuth.id],
    relationName: "entradasTorasPagamentos_createdBy_usersInAuth_id",
  }),
  entradasTora: one(entradasToras, {
    fields: [entradasTorasPagamentos.entradaId],
    references: [entradasToras.id],
  }),
  usersInAuth_updatedBy: one(usersInAuth, {
    fields: [entradasTorasPagamentos.updatedBy],
    references: [usersInAuth.id],
    relationName: "entradasTorasPagamentos_updatedBy_usersInAuth_id",
  }),
}))

export const estoqueTorasMovRelations = relations(estoqueTorasMov, ({ one }) => ({
  usersInAuth_createdBy: one(usersInAuth, {
    fields: [estoqueTorasMov.createdBy],
    references: [usersInAuth.id],
    relationName: "estoqueTorasMov_createdBy_usersInAuth_id",
  }),
  entradasTora: one(entradasToras, {
    fields: [estoqueTorasMov.entradaId],
    references: [entradasToras.id],
  }),
  especy: one(especies, {
    fields: [estoqueTorasMov.especieId],
    references: [especies.id],
  }),
  producoe: one(producoes, {
    fields: [estoqueTorasMov.producaoId],
    references: [producoes.id],
  }),
  usersInAuth_updatedBy: one(usersInAuth, {
    fields: [estoqueTorasMov.updatedBy],
    references: [usersInAuth.id],
    relationName: "estoqueTorasMov_updatedBy_usersInAuth_id",
  }),
}))

export const estoqueItensRelations = relations(estoqueItens, ({ one, many }) => ({
  usersInAuth_createdBy: one(usersInAuth, {
    fields: [estoqueItens.createdBy],
    references: [usersInAuth.id],
    relationName: "estoqueItens_createdBy_usersInAuth_id",
  }),
  especy: one(especies, {
    fields: [estoqueItens.especieId],
    references: [especies.id],
  }),
  qualidade: one(qualidades, {
    fields: [estoqueItens.qualidadeId],
    references: [qualidades.id],
  }),
  usersInAuth_updatedBy: one(usersInAuth, {
    fields: [estoqueItens.updatedBy],
    references: [usersInAuth.id],
    relationName: "estoqueItens_updatedBy_usersInAuth_id",
  }),
  estoqueMovs: many(estoqueMov),
  producoesItens: many(producoesItens),
  vendasItens: many(vendasItens),
}))

export const estoqueMovRelations = relations(estoqueMov, ({ one }) => ({
  usersInAuth_createdBy: one(usersInAuth, {
    fields: [estoqueMov.createdBy],
    references: [usersInAuth.id],
    relationName: "estoqueMov_createdBy_usersInAuth_id",
  }),
  estoqueIten: one(estoqueItens, {
    fields: [estoqueMov.estoqueItemId],
    references: [estoqueItens.id],
  }),
  producoe: one(producoes, {
    fields: [estoqueMov.producaoId],
    references: [producoes.id],
  }),
  usersInAuth_updatedBy: one(usersInAuth, {
    fields: [estoqueMov.updatedBy],
    references: [usersInAuth.id],
    relationName: "estoqueMov_updatedBy_usersInAuth_id",
  }),
  venda: one(vendas, {
    fields: [estoqueMov.vendaId],
    references: [vendas.id],
  }),
}))

export const vendasRelations = relations(vendas, ({ one, many }) => ({
  estoqueMovs: many(estoqueMov),
  vendasItens: many(vendasItens),
  romaneios: many(romaneios),
  notasFiscais: many(notasFiscais),
  cliente: one(clientes, {
    fields: [vendas.clienteId],
    references: [clientes.id],
  }),
  usersInAuth_createdBy: one(usersInAuth, {
    fields: [vendas.createdBy],
    references: [usersInAuth.id],
    relationName: "vendas_createdBy_usersInAuth_id",
  }),
  motorista: one(motoristas, {
    fields: [vendas.motoristaId],
    references: [motoristas.id],
  }),
  usersInAuth_updatedBy: one(usersInAuth, {
    fields: [vendas.updatedBy],
    references: [usersInAuth.id],
    relationName: "vendas_updatedBy_usersInAuth_id",
  }),
  veiculo: one(veiculos, {
    fields: [vendas.veiculoId],
    references: [veiculos.id],
  }),
}))

export const producoesItensRelations = relations(producoesItens, ({ one }) => ({
  usersInAuth_createdBy: one(usersInAuth, {
    fields: [producoesItens.createdBy],
    references: [usersInAuth.id],
    relationName: "producoesItens_createdBy_usersInAuth_id",
  }),
  estoqueIten: one(estoqueItens, {
    fields: [producoesItens.estoqueItemId],
    references: [estoqueItens.id],
  }),
  producoe: one(producoes, {
    fields: [producoesItens.producaoId],
    references: [producoes.id],
  }),
  usersInAuth_updatedBy: one(usersInAuth, {
    fields: [producoesItens.updatedBy],
    references: [usersInAuth.id],
    relationName: "producoesItens_updatedBy_usersInAuth_id",
  }),
}))

export const vendasItensRelations = relations(vendasItens, ({ one }) => ({
  usersInAuth_createdBy: one(usersInAuth, {
    fields: [vendasItens.createdBy],
    references: [usersInAuth.id],
    relationName: "vendasItens_createdBy_usersInAuth_id",
  }),
  estoqueIten: one(estoqueItens, {
    fields: [vendasItens.estoqueItemId],
    references: [estoqueItens.id],
  }),
  usersInAuth_updatedBy: one(usersInAuth, {
    fields: [vendasItens.updatedBy],
    references: [usersInAuth.id],
    relationName: "vendasItens_updatedBy_usersInAuth_id",
  }),
  venda: one(vendas, {
    fields: [vendasItens.vendaId],
    references: [vendas.id],
  }),
}))

export const romaneiosRelations = relations(romaneios, ({ one, many }) => ({
  usersInAuth_createdBy: one(usersInAuth, {
    fields: [romaneios.createdBy],
    references: [usersInAuth.id],
    relationName: "romaneios_createdBy_usersInAuth_id",
  }),
  usersInAuth_updatedBy: one(usersInAuth, {
    fields: [romaneios.updatedBy],
    references: [usersInAuth.id],
    relationName: "romaneios_updatedBy_usersInAuth_id",
  }),
  venda: one(vendas, {
    fields: [romaneios.vendaId],
    references: [vendas.id],
  }),
  notasFiscais: many(notasFiscais),
}))

export const notasFiscaisRelations = relations(notasFiscais, ({ one, many }) => ({
  usersInAuth_createdBy: one(usersInAuth, {
    fields: [notasFiscais.createdBy],
    references: [usersInAuth.id],
    relationName: "notasFiscais_createdBy_usersInAuth_id",
  }),
  romaneio: one(romaneios, {
    fields: [notasFiscais.romaneioId],
    references: [romaneios.id],
  }),
  usersInAuth_updatedBy: one(usersInAuth, {
    fields: [notasFiscais.updatedBy],
    references: [usersInAuth.id],
    relationName: "notasFiscais_updatedBy_usersInAuth_id",
  }),
  venda: one(vendas, {
    fields: [notasFiscais.vendaId],
    references: [vendas.id],
  }),
  nfeEventos: many(nfeEventos),
  nfeLogs: many(nfeLogs),
}))

export const nfeEventosRelations = relations(nfeEventos, ({ one }) => ({
  usersInAuth_createdBy: one(usersInAuth, {
    fields: [nfeEventos.createdBy],
    references: [usersInAuth.id],
    relationName: "nfeEventos_createdBy_usersInAuth_id",
  }),
  notasFiscai: one(notasFiscais, {
    fields: [nfeEventos.notaId],
    references: [notasFiscais.id],
  }),
  usersInAuth_updatedBy: one(usersInAuth, {
    fields: [nfeEventos.updatedBy],
    references: [usersInAuth.id],
    relationName: "nfeEventos_updatedBy_usersInAuth_id",
  }),
}))

export const nfeLogsRelations = relations(nfeLogs, ({ one }) => ({
  usersInAuth_createdBy: one(usersInAuth, {
    fields: [nfeLogs.createdBy],
    references: [usersInAuth.id],
    relationName: "nfeLogs_createdBy_usersInAuth_id",
  }),
  notasFiscai: one(notasFiscais, {
    fields: [nfeLogs.notaId],
    references: [notasFiscais.id],
  }),
  usersInAuth_updatedBy: one(usersInAuth, {
    fields: [nfeLogs.updatedBy],
    references: [usersInAuth.id],
    relationName: "nfeLogs_updatedBy_usersInAuth_id",
  }),
}))

export const orcamentosSiteRelations = relations(orcamentosSite, ({ one }) => ({
  usersInAuth_createdBy: one(usersInAuth, {
    fields: [orcamentosSite.createdBy],
    references: [usersInAuth.id],
    relationName: "orcamentosSite_createdBy_usersInAuth_id",
  }),
  usersInAuth_updatedBy: one(usersInAuth, {
    fields: [orcamentosSite.updatedBy],
    references: [usersInAuth.id],
    relationName: "orcamentosSite_updatedBy_usersInAuth_id",
  }),
}))

export const auditoriaRelations = relations(auditoria, ({ one }) => ({
  usersInAuth: one(usersInAuth, {
    fields: [auditoria.usuarioId],
    references: [usersInAuth.id],
  }),
}))
