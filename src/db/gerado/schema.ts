// ARQUIVO GERADO por `npm run db:pull` — não edite à mão.
// Fonte da verdade: supabase/migrations/*.sql
import {
  pgTable,
  foreignKey,
  pgPolicy,
  uuid,
  text,
  boolean,
  timestamp,
  uniqueIndex,
  check,
  smallint,
  char,
  integer,
  numeric,
  index,
  date,
  unique,
  bigint,
  jsonb,
  pgView,
  pgEnum,
} from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"
import { authUsers } from "drizzle-orm/supabase"

const users = authUsers
export const usersInAuth = authUsers

export const ambienteNfe = pgEnum("ambiente_nfe", ["homologacao", "producao"])
export const formaPagamento = pgEnum("forma_pagamento", [
  "dinheiro",
  "pix",
  "transferencia",
  "boleto",
  "cheque",
  "outro",
])
export const modoMedicao = pgEnum("modo_medicao", ["estereo", "m3", "tonelada"])
export const motivoAjuste = pgEnum("motivo_ajuste", ["inventario", "perda", "quebra", "outro"])
export const papelUsuario = pgEnum("papel_usuario", ["admin", "escritorio", "patio"])
export const statusNfe = pgEnum("status_nfe", [
  "rascunho",
  "processando",
  "autorizada",
  "rejeitada",
  "cancelada",
  "erro",
])
export const statusOrcamento = pgEnum("status_orcamento", [
  "novo",
  "em_atendimento",
  "concluido",
  "descartado",
])
export const statusPagamento = pgEnum("status_pagamento", ["pendente", "parcial", "pago"])
export const statusVenda = pgEnum("status_venda", [
  "rascunho",
  "confirmada",
  "nfe_emitida",
  "entregue",
  "cancelada",
])
export const tipoEventoNfe = pgEnum("tipo_evento_nfe", ["cancelamento", "carta_correcao"])
export const tipoFrete = pgEnum("tipo_frete", ["cif", "fob", "sem_frete"])
export const tipoMovEstoque = pgEnum("tipo_mov_estoque", [
  "producao",
  "venda",
  "estorno_venda",
  "ajuste",
])
export const tipoMovTora = pgEnum("tipo_mov_tora", ["compra", "consumo", "ajuste"])
export const tipoPreco = pgEnum("tipo_preco", ["compra_tora", "venda_serrada"])
export const tipoVeiculo = pgEnum("tipo_veiculo", [
  "caminhonete",
  "toco",
  "truck",
  "carreta",
  "bitrem",
  "rodotrem",
  "outro",
])
export const unidadeMedida = pgEnum("unidade_medida", ["st", "m3", "t"])

export const usuarios = pgTable(
  "usuarios",
  {
    id: uuid().primaryKey().notNull(),
    nome: text().notNull(),
    email: text().notNull(),
    papel: papelUsuario().default("admin").notNull(),
    ativo: boolean().default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  },
  (table) => [
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "usuarios_created_by_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.id],
      foreignColumns: [users.id],
      name: "usuarios_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [users.id],
      name: "usuarios_updated_by_fkey",
    }).onDelete("set null"),
    pgPolicy("usuario ativo", {
      as: "permissive",
      for: "all",
      to: ["authenticated"],
      using: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
      withCheck: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
    }),
  ]
)

export const empresas = pgTable(
  "empresas",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    razaoSocial: text("razao_social").notNull(),
    nomeFantasia: text("nome_fantasia"),
    cnpj: text().notNull(),
    ie: text(),
    im: text(),
    crt: smallint().default(1).notNull(),
    cep: text(),
    logradouro: text(),
    numero: text(),
    complemento: text(),
    bairro: text(),
    municipio: text(),
    codigoIbge: text("codigo_ibge"),
    uf: char({ length: 2 }),
    telefone: text(),
    email: text(),
    logoPath: text("logo_path"),
    nfeSerie: integer("nfe_serie").default(1).notNull(),
    nfeProximoNumero: integer("nfe_proximo_numero").default(1).notNull(),
    cfopInterno: text("cfop_interno").default("5101").notNull(),
    cfopInterestadual: text("cfop_interestadual").default("6101").notNull(),
    csosn: text().default("102"),
    cstIcms: text("cst_icms"),
    aliquotaIcms: numeric("aliquota_icms", { precision: 5, scale: 2 }).default("0").notNull(),
    cstPis: text("cst_pis").default("07").notNull(),
    aliquotaPis: numeric("aliquota_pis", { precision: 5, scale: 2 }).default("0").notNull(),
    cstCofins: text("cst_cofins").default("07").notNull(),
    aliquotaCofins: numeric("aliquota_cofins", { precision: 5, scale: 2 }).default("0").notNull(),
    informacoesComplementares: text("informacoes_complementares"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  },
  (table) => [
    uniqueIndex("empresas_unica").using("btree", sql`(true)`),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "empresas_created_by_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [users.id],
      name: "empresas_updated_by_fkey",
    }).onDelete("set null"),
    pgPolicy("usuario ativo", {
      as: "permissive",
      for: "all",
      to: ["authenticated"],
      using: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
      withCheck: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
    }),
    check("empresas_cep_check", sql`cep ~ '^\d{8}$'::text`),
    check("empresas_cnpj_check", sql`cnpj ~ '^\d{14}$'::text`),
    check("empresas_codigo_ibge_check", sql`codigo_ibge ~ '^\d{7}$'::text`),
    check("empresas_crt_check", sql`(crt >= 1) AND (crt <= 4)`),
    check("empresas_nfe_proximo_numero_check", sql`nfe_proximo_numero > 0`),
    check("empresas_nfe_serie_check", sql`(nfe_serie >= 0) AND (nfe_serie <= 999)`),
  ]
)

export const fornecedores = pgTable(
  "fornecedores",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    nome: text().notNull(),
    documento: text(),
    ie: text(),
    telefone: text(),
    email: text(),
    cep: text(),
    logradouro: text(),
    numero: text(),
    bairro: text(),
    municipio: text(),
    uf: char({ length: 2 }),
    observacoes: text(),
    ativo: boolean().default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  },
  (table) => [
    uniqueIndex("fornecedores_documento")
      .using("btree", table.documento.asc().nullsLast().op("text_ops"))
      .where(sql`(documento IS NOT NULL)`),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "fornecedores_created_by_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [users.id],
      name: "fornecedores_updated_by_fkey",
    }).onDelete("set null"),
    pgPolicy("usuario ativo", {
      as: "permissive",
      for: "all",
      to: ["authenticated"],
      using: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
      withCheck: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
    }),
    check("fornecedores_cep_check", sql`cep ~ '^\d{8}$'::text`),
    check("fornecedores_documento_check", sql`documento ~ '^(\d{11}|\d{14})$'::text`),
  ]
)

export const clientes = pgTable(
  "clientes",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    razaoSocial: text("razao_social").notNull(),
    nomeFantasia: text("nome_fantasia"),
    documento: text().notNull(),
    ie: text(),
    indicadorIe: smallint("indicador_ie").default(9).notNull(),
    email: text(),
    telefone: text(),
    cep: text(),
    logradouro: text(),
    numero: text(),
    complemento: text(),
    bairro: text(),
    municipio: text(),
    codigoIbge: text("codigo_ibge"),
    uf: char({ length: 2 }),
    observacoes: text(),
    ativo: boolean().default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  },
  (table) => [
    uniqueIndex("clientes_documento").using(
      "btree",
      table.documento.asc().nullsLast().op("text_ops")
    ),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "clientes_created_by_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [users.id],
      name: "clientes_updated_by_fkey",
    }).onDelete("set null"),
    pgPolicy("usuario ativo", {
      as: "permissive",
      for: "all",
      to: ["authenticated"],
      using: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
      withCheck: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
    }),
    check("clientes_cep_check", sql`cep ~ '^\d{8}$'::text`),
    check("clientes_codigo_ibge_check", sql`codigo_ibge ~ '^\d{7}$'::text`),
    check("clientes_documento_check", sql`documento ~ '^(\d{11}|\d{14})$'::text`),
    check("clientes_indicador_ie_check", sql`indicador_ie = ANY (ARRAY[1, 2, 9])`),
  ]
)

export const motoristas = pgTable(
  "motoristas",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    nome: text().notNull(),
    cpf: text(),
    cnh: text(),
    telefone: text(),
    transportadora: text(),
    ativo: boolean().default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  },
  (table) => [
    uniqueIndex("motoristas_cpf")
      .using("btree", table.cpf.asc().nullsLast().op("text_ops"))
      .where(sql`(cpf IS NOT NULL)`),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "motoristas_created_by_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [users.id],
      name: "motoristas_updated_by_fkey",
    }).onDelete("set null"),
    pgPolicy("usuario ativo", {
      as: "permissive",
      for: "all",
      to: ["authenticated"],
      using: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
      withCheck: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
    }),
    check("motoristas_cpf_check", sql`cpf ~ '^\d{11}$'::text`),
  ]
)

export const veiculos = pgTable(
  "veiculos",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    placa: text().notNull(),
    tipo: tipoVeiculo().default("truck").notNull(),
    taraKg: numeric("tara_kg", { precision: 12, scale: 2 }),
    uf: char({ length: 2 }),
    rntc: text(),
    motoristaPadraoId: uuid("motorista_padrao_id"),
    ativo: boolean().default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  },
  (table) => [
    index("veiculos_motorista_padrao").using(
      "btree",
      table.motoristaPadraoId.asc().nullsLast().op("uuid_ops")
    ),
    uniqueIndex("veiculos_placa").using("btree", table.placa.asc().nullsLast().op("text_ops")),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "veiculos_created_by_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.motoristaPadraoId],
      foreignColumns: [motoristas.id],
      name: "veiculos_motorista_padrao_id_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [users.id],
      name: "veiculos_updated_by_fkey",
    }).onDelete("set null"),
    pgPolicy("usuario ativo", {
      as: "permissive",
      for: "all",
      to: ["authenticated"],
      using: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
      withCheck: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
    }),
    check("veiculos_placa_check", sql`placa ~ '^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$'::text`),
    check("veiculos_tara_kg_check", sql`tara_kg >= (0)::numeric`),
  ]
)

export const especies = pgTable(
  "especies",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    nome: text().notNull(),
    nomeCientifico: text("nome_cientifico"),
    conifera: boolean().default(false).notNull(),
    ncmSerrada: text("ncm_serrada"),
    ncmTora: text("ncm_tora"),
    ativo: boolean().default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  },
  (table) => [
    uniqueIndex("especies_nome").using("btree", sql`lower(nome)`),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "especies_created_by_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [users.id],
      name: "especies_updated_by_fkey",
    }).onDelete("set null"),
    pgPolicy("usuario ativo", {
      as: "permissive",
      for: "all",
      to: ["authenticated"],
      using: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
      withCheck: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
    }),
    check("especies_ncm_serrada_check", sql`ncm_serrada ~ '^\d{8}$'::text`),
    check("especies_ncm_tora_check", sql`ncm_tora ~ '^\d{8}$'::text`),
  ]
)

export const qualidades = pgTable(
  "qualidades",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    nome: text().notNull(),
    ordem: smallint().notNull(),
    ativo: boolean().default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  },
  (table) => [
    uniqueIndex("qualidades_ordem").using("btree", table.ordem.asc().nullsLast().op("int2_ops")),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "qualidades_created_by_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [users.id],
      name: "qualidades_updated_by_fkey",
    }).onDelete("set null"),
    pgPolicy("usuario ativo", {
      as: "permissive",
      for: "all",
      to: ["authenticated"],
      using: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
      withCheck: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
    }),
  ]
)

export const tabelaPrecos = pgTable(
  "tabela_precos",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    tipo: tipoPreco().notNull(),
    especieId: uuid("especie_id").notNull(),
    qualidadeId: uuid("qualidade_id"),
    unidade: unidadeMedida().notNull(),
    valor: numeric({ precision: 14, scale: 2 }).notNull(),
    vigenciaInicio: date("vigencia_inicio")
      .default(sql`CURRENT_DATE`)
      .notNull(),
    observacao: text(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  },
  (table) => [
    index("tabela_precos_qualidade").using(
      "btree",
      table.qualidadeId.asc().nullsLast().op("uuid_ops")
    ),
    uniqueIndex("tabela_precos_vigencia").using(
      "btree",
      sql`tipo`,
      sql`especie_id`,
      sql`COALESCE(qualidade_id, '00000000-0000-0000-0000-000000000000'::`,
      sql`unidade`,
      sql`vigencia_inicio`
    ),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "tabela_precos_created_by_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.especieId],
      foreignColumns: [especies.id],
      name: "tabela_precos_especie_id_fkey",
    }),
    foreignKey({
      columns: [table.qualidadeId],
      foreignColumns: [qualidades.id],
      name: "tabela_precos_qualidade_id_fkey",
    }),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [users.id],
      name: "tabela_precos_updated_by_fkey",
    }).onDelete("set null"),
    pgPolicy("usuario ativo", {
      as: "permissive",
      for: "all",
      to: ["authenticated"],
      using: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
      withCheck: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
    }),
    check(
      "tabela_precos_check",
      sql`(tipo = 'compra_tora'::tipo_preco) OR ((unidade = 'm3'::unidade_medida) AND (qualidade_id IS NOT NULL))`
    ),
    check("tabela_precos_valor_check", sql`valor >= (0)::numeric`),
  ]
)

export const entradasToras = pgTable(
  "entradas_toras",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    numero: bigint({ mode: "number" }).generatedAlwaysAsIdentity({
      name: "entradas_toras_numero_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
      cache: 1,
    }),
    especieId: uuid("especie_id").notNull(),
    fornecedorId: uuid("fornecedor_id").notNull(),
    motoristaId: uuid("motorista_id"),
    veiculoId: uuid("veiculo_id"),
    placa: text(),
    origem: text(),
    municipioOrigem: text("municipio_origem"),
    ufOrigem: char("uf_origem", { length: 2 }),
    documentoFlorestal: text("documento_florestal"),
    modoMedicao: modoMedicao("modo_medicao").notNull(),
    cargaComprimentoM: numeric("carga_comprimento_m", { precision: 10, scale: 3 }),
    cargaLarguraM: numeric("carga_largura_m", { precision: 10, scale: 3 }),
    cargaAlturaM: numeric("carga_altura_m", { precision: 10, scale: 3 }),
    pesoBrutoKg: numeric("peso_bruto_kg", { precision: 12, scale: 2 }),
    taraKg: numeric("tara_kg", { precision: 12, scale: 2 }),
    pesoLiquidoKg: numeric("peso_liquido_kg", { precision: 12, scale: 2 }),
    quantidade: numeric({ precision: 14, scale: 6 }).notNull(),
    unidade: unidadeMedida().notNull(),
    valorUnitario: numeric("valor_unitario", { precision: 14, scale: 2 }).notNull(),
    valorTotal: numeric("valor_total", { precision: 14, scale: 2 }).notNull(),
    valorPago: numeric("valor_pago", { precision: 14, scale: 2 }).default("0").notNull(),
    statusPagamento: statusPagamento("status_pagamento").default("pendente").notNull(),
    observacoes: text(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  },
  (table) => [
    index("entradas_toras_created_at").using(
      "btree",
      table.createdAt.desc().nullsFirst().op("timestamptz_ops")
    ),
    index("entradas_toras_especie").using(
      "btree",
      table.especieId.asc().nullsLast().op("uuid_ops")
    ),
    index("entradas_toras_fornecedor").using(
      "btree",
      table.fornecedorId.asc().nullsLast().op("uuid_ops")
    ),
    index("entradas_toras_motorista").using(
      "btree",
      table.motoristaId.asc().nullsLast().op("uuid_ops")
    ),
    index("entradas_toras_veiculo").using(
      "btree",
      table.veiculoId.asc().nullsLast().op("uuid_ops")
    ),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "entradas_toras_created_by_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.especieId],
      foreignColumns: [especies.id],
      name: "entradas_toras_especie_id_fkey",
    }),
    foreignKey({
      columns: [table.fornecedorId],
      foreignColumns: [fornecedores.id],
      name: "entradas_toras_fornecedor_id_fkey",
    }),
    foreignKey({
      columns: [table.motoristaId],
      foreignColumns: [motoristas.id],
      name: "entradas_toras_motorista_id_fkey",
    }),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [users.id],
      name: "entradas_toras_updated_by_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.veiculoId],
      foreignColumns: [veiculos.id],
      name: "entradas_toras_veiculo_id_fkey",
    }),
    unique("entradas_toras_numero_key").on(table.numero),
    pgPolicy("usuario ativo", {
      as: "permissive",
      for: "all",
      to: ["authenticated"],
      using: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
      withCheck: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
    }),
    check("entradas_toras_carga_altura_m_check", sql`carga_altura_m > (0)::numeric`),
    check("entradas_toras_carga_comprimento_m_check", sql`carga_comprimento_m > (0)::numeric`),
    check("entradas_toras_carga_largura_m_check", sql`carga_largura_m > (0)::numeric`),
    check(
      "entradas_toras_check",
      sql`(modo_medicao <> 'estereo'::modo_medicao) OR ((carga_comprimento_m IS NOT NULL) AND (carga_largura_m IS NOT NULL) AND (carga_altura_m IS NOT NULL))`
    ),
    check(
      "entradas_toras_check1",
      sql`(modo_medicao <> 'tonelada'::modo_medicao) OR ((peso_bruto_kg IS NOT NULL) AND (tara_kg IS NOT NULL))`
    ),
    check("entradas_toras_peso_bruto_kg_check", sql`peso_bruto_kg >= (0)::numeric`),
    check("entradas_toras_peso_liquido_kg_check", sql`peso_liquido_kg >= (0)::numeric`),
    check("entradas_toras_quantidade_check", sql`quantidade > (0)::numeric`),
    check("entradas_toras_tara_kg_check", sql`tara_kg >= (0)::numeric`),
    check("entradas_toras_valor_pago_check", sql`valor_pago >= (0)::numeric`),
    check("entradas_toras_valor_total_check", sql`valor_total >= (0)::numeric`),
    check("entradas_toras_valor_unitario_check", sql`valor_unitario >= (0)::numeric`),
  ]
)

export const entradasTorasItens = pgTable(
  "entradas_toras_itens",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    entradaId: uuid("entrada_id").notNull(),
    diametroCm: numeric("diametro_cm", { precision: 8, scale: 2 }).notNull(),
    comprimentoM: numeric("comprimento_m", { precision: 8, scale: 3 }).notNull(),
    quantidade: integer().default(1).notNull(),
    volumeM3: numeric("volume_m3", { precision: 14, scale: 6 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  },
  (table) => [
    index("entradas_toras_itens_entrada").using(
      "btree",
      table.entradaId.asc().nullsLast().op("uuid_ops")
    ),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "entradas_toras_itens_created_by_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.entradaId],
      foreignColumns: [entradasToras.id],
      name: "entradas_toras_itens_entrada_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [users.id],
      name: "entradas_toras_itens_updated_by_fkey",
    }).onDelete("set null"),
    pgPolicy("usuario ativo", {
      as: "permissive",
      for: "all",
      to: ["authenticated"],
      using: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
      withCheck: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
    }),
    check("entradas_toras_itens_comprimento_m_check", sql`comprimento_m > (0)::numeric`),
    check("entradas_toras_itens_diametro_cm_check", sql`diametro_cm > (0)::numeric`),
    check("entradas_toras_itens_quantidade_check", sql`quantidade > 0`),
    check("entradas_toras_itens_volume_m3_check", sql`volume_m3 >= (0)::numeric`),
  ]
)

export const entradasTorasPagamentos = pgTable(
  "entradas_toras_pagamentos",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    entradaId: uuid("entrada_id").notNull(),
    dataPagamento: date("data_pagamento")
      .default(sql`CURRENT_DATE`)
      .notNull(),
    valor: numeric({ precision: 14, scale: 2 }).notNull(),
    forma: formaPagamento().notNull(),
    observacao: text(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  },
  (table) => [
    index("entradas_toras_pagamentos_entrada").using(
      "btree",
      table.entradaId.asc().nullsLast().op("uuid_ops")
    ),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "entradas_toras_pagamentos_created_by_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.entradaId],
      foreignColumns: [entradasToras.id],
      name: "entradas_toras_pagamentos_entrada_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [users.id],
      name: "entradas_toras_pagamentos_updated_by_fkey",
    }).onDelete("set null"),
    pgPolicy("usuario ativo", {
      as: "permissive",
      for: "all",
      to: ["authenticated"],
      using: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
      withCheck: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
    }),
    check("entradas_toras_pagamentos_valor_check", sql`valor > (0)::numeric`),
  ]
)

export const estoqueTorasMov = pgTable(
  "estoque_toras_mov",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    especieId: uuid("especie_id").notNull(),
    tipo: tipoMovTora().notNull(),
    quantidade: numeric({ precision: 14, scale: 6 }).notNull(),
    unidade: unidadeMedida().notNull(),
    entradaId: uuid("entrada_id"),
    producaoId: uuid("producao_id"),
    motivo: text(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  },
  (table) => [
    index("estoque_toras_mov_entrada").using(
      "btree",
      table.entradaId.asc().nullsLast().op("uuid_ops")
    ),
    index("estoque_toras_mov_especie").using(
      "btree",
      table.especieId.asc().nullsLast().op("uuid_ops"),
      table.unidade.asc().nullsLast().op("uuid_ops")
    ),
    index("estoque_toras_mov_producao").using(
      "btree",
      table.producaoId.asc().nullsLast().op("uuid_ops")
    ),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "estoque_toras_mov_created_by_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.entradaId],
      foreignColumns: [entradasToras.id],
      name: "estoque_toras_mov_entrada_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.especieId],
      foreignColumns: [especies.id],
      name: "estoque_toras_mov_especie_id_fkey",
    }),
    foreignKey({
      columns: [table.producaoId],
      foreignColumns: [producoes.id],
      name: "estoque_toras_mov_producao_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [users.id],
      name: "estoque_toras_mov_updated_by_fkey",
    }).onDelete("set null"),
    pgPolicy("usuario ativo", {
      as: "permissive",
      for: "all",
      to: ["authenticated"],
      using: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
      withCheck: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
    }),
    check(
      "estoque_toras_mov_check",
      sql`(tipo <> 'ajuste'::tipo_mov_tora) OR (motivo IS NOT NULL)`
    ),
    check("estoque_toras_mov_quantidade_check", sql`quantidade <> (0)::numeric`),
  ]
)

export const estoqueItens = pgTable(
  "estoque_itens",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    especieId: uuid("especie_id").notNull(),
    qualidadeId: uuid("qualidade_id").notNull(),
    espessuraCm: numeric("espessura_cm", { precision: 8, scale: 2 }).notNull(),
    larguraCm: numeric("largura_cm", { precision: 8, scale: 2 }).notNull(),
    comprimentoM: numeric("comprimento_m", { precision: 8, scale: 3 }).notNull(),
    volumePecaM3: numeric("volume_peca_m3", { precision: 14, scale: 6 }).generatedAlwaysAs(
      sql`round((((espessura_cm / (100)::numeric) * (largura_cm / (100)::numeric)) * comprimento_m), 6)`
    ),
    saldoPecas: integer("saldo_pecas").default(0).notNull(),
    saldoM3: numeric("saldo_m3", { precision: 14, scale: 6 }).generatedAlwaysAs(
      sql`round(((((saldo_pecas)::numeric * (espessura_cm / (100)::numeric)) * (largura_cm / (100)::numeric)) * comprimento_m), 6)`
    ),
    estoqueMinimoPecas: integer("estoque_minimo_pecas").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  },
  (table) => [
    uniqueIndex("estoque_itens_bitola").using(
      "btree",
      table.especieId.asc().nullsLast().op("numeric_ops"),
      table.qualidadeId.asc().nullsLast().op("numeric_ops"),
      table.espessuraCm.asc().nullsLast().op("uuid_ops"),
      table.larguraCm.asc().nullsLast().op("numeric_ops"),
      table.comprimentoM.asc().nullsLast().op("numeric_ops")
    ),
    index("estoque_itens_qualidade").using(
      "btree",
      table.qualidadeId.asc().nullsLast().op("uuid_ops")
    ),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "estoque_itens_created_by_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.especieId],
      foreignColumns: [especies.id],
      name: "estoque_itens_especie_id_fkey",
    }),
    foreignKey({
      columns: [table.qualidadeId],
      foreignColumns: [qualidades.id],
      name: "estoque_itens_qualidade_id_fkey",
    }),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [users.id],
      name: "estoque_itens_updated_by_fkey",
    }).onDelete("set null"),
    pgPolicy("usuario ativo", {
      as: "permissive",
      for: "all",
      to: ["authenticated"],
      using: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
      withCheck: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
    }),
    check("estoque_itens_comprimento_m_check", sql`comprimento_m > (0)::numeric`),
    check("estoque_itens_espessura_cm_check", sql`espessura_cm > (0)::numeric`),
    check("estoque_itens_estoque_minimo_pecas_check", sql`estoque_minimo_pecas >= 0`),
    check("estoque_itens_largura_cm_check", sql`largura_cm > (0)::numeric`),
  ]
)

export const estoqueMov = pgTable(
  "estoque_mov",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    estoqueItemId: uuid("estoque_item_id").notNull(),
    tipo: tipoMovEstoque().notNull(),
    quantidade: integer().notNull(),
    saldoApos: integer("saldo_apos"),
    motivo: motivoAjuste(),
    observacao: text(),
    permitirNegativo: boolean("permitir_negativo").default(false).notNull(),
    producaoId: uuid("producao_id"),
    vendaId: uuid("venda_id"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  },
  (table) => [
    index("estoque_mov_item").using(
      "btree",
      table.estoqueItemId.asc().nullsLast().op("uuid_ops"),
      table.createdAt.desc().nullsFirst().op("timestamptz_ops")
    ),
    index("estoque_mov_producao").using("btree", table.producaoId.asc().nullsLast().op("uuid_ops")),
    index("estoque_mov_venda").using("btree", table.vendaId.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "estoque_mov_created_by_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.estoqueItemId],
      foreignColumns: [estoqueItens.id],
      name: "estoque_mov_estoque_item_id_fkey",
    }),
    foreignKey({
      columns: [table.producaoId],
      foreignColumns: [producoes.id],
      name: "estoque_mov_producao_fk",
    }),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [users.id],
      name: "estoque_mov_updated_by_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.vendaId],
      foreignColumns: [vendas.id],
      name: "estoque_mov_venda_fk",
    }),
    pgPolicy("usuario ativo", {
      as: "permissive",
      for: "all",
      to: ["authenticated"],
      using: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
      withCheck: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
    }),
    check("estoque_mov_check", sql`(tipo <> 'ajuste'::tipo_mov_estoque) OR (motivo IS NOT NULL)`),
    check("estoque_mov_quantidade_check", sql`quantidade <> 0`),
  ]
)

export const producoes = pgTable(
  "producoes",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    numero: bigint({ mode: "number" }).generatedAlwaysAsIdentity({
      name: "producoes_numero_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
      cache: 1,
    }),
    dataProducao: date("data_producao")
      .default(sql`CURRENT_DATE`)
      .notNull(),
    especieId: uuid("especie_id").notNull(),
    torasConsumidasM3: numeric("toras_consumidas_m3", { precision: 14, scale: 6 }),
    volumeSerradoM3: numeric("volume_serrado_m3", { precision: 14, scale: 6 })
      .default("0")
      .notNull(),
    totalPecas: integer("total_pecas").default(0).notNull(),
    rendimentoPercentual: numeric("rendimento_percentual", { precision: 7, scale: 3 }),
    observacoes: text(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  },
  (table) => [
    index("producoes_data").using("btree", table.dataProducao.desc().nullsFirst().op("date_ops")),
    index("producoes_especie").using("btree", table.especieId.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "producoes_created_by_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.especieId],
      foreignColumns: [especies.id],
      name: "producoes_especie_id_fkey",
    }),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [users.id],
      name: "producoes_updated_by_fkey",
    }).onDelete("set null"),
    unique("producoes_numero_key").on(table.numero),
    pgPolicy("usuario ativo", {
      as: "permissive",
      for: "all",
      to: ["authenticated"],
      using: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
      withCheck: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
    }),
    check("producoes_toras_consumidas_m3_check", sql`toras_consumidas_m3 > (0)::numeric`),
  ]
)

export const producoesItens = pgTable(
  "producoes_itens",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    producaoId: uuid("producao_id").notNull(),
    estoqueItemId: uuid("estoque_item_id").notNull(),
    quantidade: integer().notNull(),
    volumePecaM3: numeric("volume_peca_m3", { precision: 14, scale: 6 }).notNull(),
    volumeTotalM3: numeric("volume_total_m3", { precision: 14, scale: 6 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  },
  (table) => [
    index("producoes_itens_estoque_item").using(
      "btree",
      table.estoqueItemId.asc().nullsLast().op("uuid_ops")
    ),
    index("producoes_itens_producao").using(
      "btree",
      table.producaoId.asc().nullsLast().op("uuid_ops")
    ),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "producoes_itens_created_by_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.estoqueItemId],
      foreignColumns: [estoqueItens.id],
      name: "producoes_itens_estoque_item_id_fkey",
    }),
    foreignKey({
      columns: [table.producaoId],
      foreignColumns: [producoes.id],
      name: "producoes_itens_producao_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [users.id],
      name: "producoes_itens_updated_by_fkey",
    }).onDelete("set null"),
    pgPolicy("usuario ativo", {
      as: "permissive",
      for: "all",
      to: ["authenticated"],
      using: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
      withCheck: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
    }),
    check("producoes_itens_quantidade_check", sql`quantidade > 0`),
  ]
)

export const vendas = pgTable(
  "vendas",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    numero: bigint({ mode: "number" }).generatedAlwaysAsIdentity({
      name: "vendas_numero_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
      cache: 1,
    }),
    clienteId: uuid("cliente_id").notNull(),
    motoristaId: uuid("motorista_id"),
    veiculoId: uuid("veiculo_id"),
    placa: text(),
    destinoCep: text("destino_cep"),
    destinoLogradouro: text("destino_logradouro"),
    destinoNumero: text("destino_numero"),
    destinoComplemento: text("destino_complemento"),
    destinoBairro: text("destino_bairro"),
    destinoMunicipio: text("destino_municipio"),
    destinoCodigoIbge: text("destino_codigo_ibge"),
    destinoUf: char("destino_uf", { length: 2 }),
    tipoFrete: tipoFrete("tipo_frete").default("sem_frete").notNull(),
    valorFrete: numeric("valor_frete", { precision: 14, scale: 2 }).default("0").notNull(),
    desconto: numeric({ precision: 14, scale: 2 }).default("0").notNull(),
    totalPecas: integer("total_pecas").default(0).notNull(),
    totalM3: numeric("total_m3", { precision: 14, scale: 6 }).default("0").notNull(),
    valorProdutos: numeric("valor_produtos", { precision: 14, scale: 2 }).default("0").notNull(),
    valorTotal: numeric("valor_total", { precision: 14, scale: 2 }).default("0").notNull(),
    status: statusVenda().default("rascunho").notNull(),
    documentoFlorestal: text("documento_florestal"),
    observacoes: text(),
    confirmadaEm: timestamp("confirmada_em", { withTimezone: true, mode: "string" }),
    entregueEm: timestamp("entregue_em", { withTimezone: true, mode: "string" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  },
  (table) => [
    index("vendas_cliente").using("btree", table.clienteId.asc().nullsLast().op("uuid_ops")),
    index("vendas_created_at").using(
      "btree",
      table.createdAt.desc().nullsFirst().op("timestamptz_ops")
    ),
    index("vendas_motorista").using("btree", table.motoristaId.asc().nullsLast().op("uuid_ops")),
    index("vendas_status").using("btree", table.status.asc().nullsLast().op("enum_ops")),
    index("vendas_veiculo").using("btree", table.veiculoId.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.clienteId],
      foreignColumns: [clientes.id],
      name: "vendas_cliente_id_fkey",
    }),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "vendas_created_by_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.motoristaId],
      foreignColumns: [motoristas.id],
      name: "vendas_motorista_id_fkey",
    }),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [users.id],
      name: "vendas_updated_by_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.veiculoId],
      foreignColumns: [veiculos.id],
      name: "vendas_veiculo_id_fkey",
    }),
    unique("vendas_numero_key").on(table.numero),
    pgPolicy("usuario ativo", {
      as: "permissive",
      for: "all",
      to: ["authenticated"],
      using: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
      withCheck: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
    }),
    check("vendas_desconto_check", sql`desconto >= (0)::numeric`),
    check("vendas_destino_cep_check", sql`destino_cep ~ '^\d{8}$'::text`),
    check("vendas_destino_codigo_ibge_check", sql`destino_codigo_ibge ~ '^\d{7}$'::text`),
    check("vendas_valor_frete_check", sql`valor_frete >= (0)::numeric`),
  ]
)

export const vendasItens = pgTable(
  "vendas_itens",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    vendaId: uuid("venda_id").notNull(),
    estoqueItemId: uuid("estoque_item_id").notNull(),
    descricao: text().notNull(),
    quantidade: integer().notNull(),
    volumeM3: numeric("volume_m3", { precision: 14, scale: 6 }).notNull(),
    precoM3: numeric("preco_m3", { precision: 14, scale: 2 }).notNull(),
    valorTotal: numeric("valor_total", { precision: 14, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  },
  (table) => [
    index("vendas_itens_estoque_item").using(
      "btree",
      table.estoqueItemId.asc().nullsLast().op("uuid_ops")
    ),
    index("vendas_itens_venda").using("btree", table.vendaId.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "vendas_itens_created_by_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.estoqueItemId],
      foreignColumns: [estoqueItens.id],
      name: "vendas_itens_estoque_item_id_fkey",
    }),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [users.id],
      name: "vendas_itens_updated_by_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.vendaId],
      foreignColumns: [vendas.id],
      name: "vendas_itens_venda_id_fkey",
    }).onDelete("cascade"),
    pgPolicy("usuario ativo", {
      as: "permissive",
      for: "all",
      to: ["authenticated"],
      using: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
      withCheck: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
    }),
    check("vendas_itens_preco_m3_check", sql`preco_m3 >= (0)::numeric`),
    check("vendas_itens_quantidade_check", sql`quantidade > 0`),
  ]
)

export const romaneios = pgTable(
  "romaneios",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    numero: bigint({ mode: "number" }).generatedAlwaysAsIdentity({
      name: "romaneios_numero_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
      cache: 1,
    }),
    vendaId: uuid("venda_id").notNull(),
    emitidoEm: timestamp("emitido_em", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    conferente: text(),
    observacoes: text(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  },
  (table) => [
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "romaneios_created_by_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [users.id],
      name: "romaneios_updated_by_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.vendaId],
      foreignColumns: [vendas.id],
      name: "romaneios_venda_id_fkey",
    }),
    unique("romaneios_numero_key").on(table.numero),
    unique("romaneios_venda_id_key").on(table.vendaId),
    pgPolicy("usuario ativo", {
      as: "permissive",
      for: "all",
      to: ["authenticated"],
      using: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
      withCheck: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
    }),
  ]
)

export const notasFiscais = pgTable(
  "notas_fiscais",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    vendaId: uuid("venda_id").notNull(),
    romaneioId: uuid("romaneio_id"),
    ambiente: ambienteNfe().notNull(),
    provedor: text().notNull(),
    referencia: text().notNull(),
    numero: integer(),
    serie: integer(),
    chave: char({ length: 44 }),
    protocolo: text(),
    status: statusNfe().default("rascunho").notNull(),
    motivoStatus: text("motivo_status"),
    xmlPath: text("xml_path"),
    danfePath: text("danfe_path"),
    autorizadaEm: timestamp("autorizada_em", { withTimezone: true, mode: "string" }),
    canceladaEm: timestamp("cancelada_em", { withTimezone: true, mode: "string" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  },
  (table) => [
    uniqueIndex("notas_fiscais_chave")
      .using("btree", table.chave.asc().nullsLast().op("bpchar_ops"))
      .where(sql`(chave IS NOT NULL)`),
    uniqueIndex("notas_fiscais_numero")
      .using(
        "btree",
        table.ambiente.asc().nullsLast().op("int4_ops"),
        table.serie.asc().nullsLast().op("int4_ops"),
        table.numero.asc().nullsLast().op("enum_ops")
      )
      .where(sql`(numero IS NOT NULL)`),
    index("notas_fiscais_romaneio").using(
      "btree",
      table.romaneioId.asc().nullsLast().op("uuid_ops")
    ),
    index("notas_fiscais_venda").using("btree", table.vendaId.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "notas_fiscais_created_by_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.romaneioId],
      foreignColumns: [romaneios.id],
      name: "notas_fiscais_romaneio_id_fkey",
    }),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [users.id],
      name: "notas_fiscais_updated_by_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.vendaId],
      foreignColumns: [vendas.id],
      name: "notas_fiscais_venda_id_fkey",
    }),
    unique("notas_fiscais_referencia_key").on(table.referencia),
    pgPolicy("usuario ativo", {
      as: "permissive",
      for: "all",
      to: ["authenticated"],
      using: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
      withCheck: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
    }),
    check("notas_fiscais_chave_check", sql`chave ~ '^\d{44}$'::text`),
  ]
)

export const nfeEventos = pgTable(
  "nfe_eventos",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    notaId: uuid("nota_id").notNull(),
    tipo: tipoEventoNfe().notNull(),
    sequencia: smallint().default(1).notNull(),
    texto: text().notNull(),
    protocolo: text(),
    status: text().default("processando").notNull(),
    motivoStatus: text("motivo_status"),
    xmlPath: text("xml_path"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  },
  (table) => [
    uniqueIndex("nfe_eventos_sequencia").using(
      "btree",
      table.notaId.asc().nullsLast().op("int2_ops"),
      table.tipo.asc().nullsLast().op("int2_ops"),
      table.sequencia.asc().nullsLast().op("int2_ops")
    ),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "nfe_eventos_created_by_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.notaId],
      foreignColumns: [notasFiscais.id],
      name: "nfe_eventos_nota_id_fkey",
    }),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [users.id],
      name: "nfe_eventos_updated_by_fkey",
    }).onDelete("set null"),
    pgPolicy("usuario ativo", {
      as: "permissive",
      for: "all",
      to: ["authenticated"],
      using: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
      withCheck: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
    }),
    check(
      "nfe_eventos_check",
      sql`(tipo <> 'cancelamento'::tipo_evento_nfe) OR (char_length(texto) >= 15)`
    ),
    check(
      "nfe_eventos_check1",
      sql`(tipo <> 'carta_correcao'::tipo_evento_nfe) OR (char_length(texto) >= 15)`
    ),
  ]
)

export const nfeLogs = pgTable(
  "nfe_logs",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    notaId: uuid("nota_id"),
    provedor: text().notNull(),
    operacao: text().notNull(),
    httpStatus: integer("http_status"),
    sucesso: boolean().notNull(),
    request: jsonb(),
    response: jsonb(),
    duracaoMs: integer("duracao_ms"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  },
  (table) => [
    index("nfe_logs_nota").using(
      "btree",
      table.notaId.asc().nullsLast().op("timestamptz_ops"),
      table.createdAt.desc().nullsFirst().op("timestamptz_ops")
    ),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "nfe_logs_created_by_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.notaId],
      foreignColumns: [notasFiscais.id],
      name: "nfe_logs_nota_id_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [users.id],
      name: "nfe_logs_updated_by_fkey",
    }).onDelete("set null"),
    pgPolicy("usuario ativo", {
      as: "permissive",
      for: "all",
      to: ["authenticated"],
      using: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
      withCheck: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
    }),
  ]
)

export const orcamentosSite = pgTable(
  "orcamentos_site",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    nome: text().notNull(),
    telefone: text().notNull(),
    email: text(),
    cidade: text(),
    produto: text(),
    mensagem: text(),
    status: statusOrcamento().default("novo").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  },
  (table) => [
    index("orcamentos_site_status").using(
      "btree",
      table.status.asc().nullsLast().op("timestamptz_ops"),
      table.createdAt.desc().nullsFirst().op("timestamptz_ops")
    ),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [users.id],
      name: "orcamentos_site_created_by_fkey",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.updatedBy],
      foreignColumns: [users.id],
      name: "orcamentos_site_updated_by_fkey",
    }).onDelete("set null"),
    pgPolicy("site envia orcamento", {
      as: "permissive",
      for: "insert",
      to: ["anon"],
      withCheck: sql`(status = 'novo'::status_orcamento)`,
    }),
    pgPolicy("usuario ativo", { as: "permissive", for: "all", to: ["authenticated"] }),
    check("orcamentos_site_cidade_check", sql`char_length(cidade) <= 120`),
    check("orcamentos_site_email_check", sql`char_length(email) <= 200`),
    check("orcamentos_site_mensagem_check", sql`char_length(mensagem) <= 2000`),
    check(
      "orcamentos_site_nome_check",
      sql`(char_length(nome) >= 2) AND (char_length(nome) <= 120)`
    ),
    check("orcamentos_site_produto_check", sql`char_length(produto) <= 200`),
    check(
      "orcamentos_site_telefone_check",
      sql`(char_length(telefone) >= 8) AND (char_length(telefone) <= 30)`
    ),
  ]
)

export const auditoria = pgTable(
  "auditoria",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity({
      name: "auditoria_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
      cache: 1,
    }),
    tabela: text().notNull(),
    registroId: text("registro_id").notNull(),
    acao: text().notNull(),
    usuarioId: uuid("usuario_id"),
    dadosAntes: jsonb("dados_antes"),
    dadosDepois: jsonb("dados_depois"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("auditoria_registro").using(
      "btree",
      table.tabela.asc().nullsLast().op("text_ops"),
      table.registroId.asc().nullsLast().op("text_ops"),
      table.createdAt.desc().nullsFirst().op("text_ops")
    ),
    index("auditoria_usuario").using(
      "btree",
      table.usuarioId.asc().nullsLast().op("timestamptz_ops"),
      table.createdAt.desc().nullsFirst().op("timestamptz_ops")
    ),
    foreignKey({
      columns: [table.usuarioId],
      foreignColumns: [users.id],
      name: "auditoria_usuario_id_fkey",
    }).onDelete("set null"),
    pgPolicy("usuario ativo le", {
      as: "permissive",
      for: "select",
      to: ["authenticated"],
      using: sql`( SELECT private.usuario_ativo() AS usuario_ativo)`,
    }),
    check(
      "auditoria_acao_check",
      sql`acao = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])`
    ),
  ]
)
export const estoqueTorasSaldo = pgView("estoque_toras_saldo", {
  especieId: uuid("especie_id"),
  unidade: unidadeMedida(),
  saldo: numeric({ precision: 14, scale: 6 }),
})
  .with({ securityInvoker: true })
  .as(
    sql`SELECT especie_id, unidade, sum(quantidade)::numeric(14,6) AS saldo FROM estoque_toras_mov GROUP BY especie_id, unidade`
  )

export const precosVigentes = pgView("precos_vigentes", {
  id: uuid(),
  tipo: tipoPreco(),
  especieId: uuid("especie_id"),
  qualidadeId: uuid("qualidade_id"),
  unidade: unidadeMedida(),
  valor: numeric({ precision: 14, scale: 2 }),
  vigenciaInicio: date("vigencia_inicio"),
})
  .with({ securityInvoker: true })
  .as(
    sql`SELECT DISTINCT ON (tipo, especie_id, qualidade_id, unidade) id, tipo, especie_id, qualidade_id, unidade, valor, vigencia_inicio FROM tabela_precos WHERE vigencia_inicio <= (now() AT TIME ZONE 'America/Sao_Paulo'::text)::date ORDER BY tipo, especie_id, qualidade_id, unidade, vigencia_inicio DESC`
  )
