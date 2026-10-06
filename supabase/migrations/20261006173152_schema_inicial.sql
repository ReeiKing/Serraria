-- =============================================================================
-- Madeireira — schema inicial
-- Convenções: id uuid, created_at/updated_at automáticos, created_by/updated_by
-- preenchidos por auth.uid(); dinheiro numeric(14,2); volume numeric(14,6).
-- Funções internas ficam no schema `private` (não exposto pela Data API).
-- =============================================================================

create schema if not exists private;
grant usage on schema private to authenticated;

-- -----------------------------------------------------------------------------
-- Tipos
-- -----------------------------------------------------------------------------
create type public.papel_usuario as enum ('admin', 'escritorio', 'patio');
create type public.modo_medicao as enum ('estereo', 'm3', 'tonelada');
create type public.unidade_medida as enum ('st', 'm3', 't');
create type public.tipo_preco as enum ('compra_tora', 'venda_serrada');
create type public.status_pagamento as enum ('pendente', 'parcial', 'pago');
create type public.forma_pagamento as enum ('dinheiro', 'pix', 'transferencia', 'boleto', 'cheque', 'outro');
create type public.tipo_veiculo as enum ('caminhonete', 'toco', 'truck', 'carreta', 'bitrem', 'rodotrem', 'outro');
create type public.tipo_mov_tora as enum ('compra', 'consumo', 'ajuste');
create type public.tipo_mov_estoque as enum ('producao', 'venda', 'estorno_venda', 'ajuste');
create type public.motivo_ajuste as enum ('inventario', 'perda', 'quebra', 'outro');
create type public.status_venda as enum ('rascunho', 'confirmada', 'nfe_emitida', 'entregue', 'cancelada');
-- Valores da tag modFrete da NF-e: 0 CIF (emitente), 1 FOB (destinatário), 9 sem frete
create type public.tipo_frete as enum ('cif', 'fob', 'sem_frete');
create type public.ambiente_nfe as enum ('homologacao', 'producao');
create type public.status_nfe as enum ('rascunho', 'processando', 'autorizada', 'rejeitada', 'cancelada', 'erro');
create type public.tipo_evento_nfe as enum ('cancelamento', 'carta_correcao');
create type public.status_orcamento as enum ('novo', 'em_atendimento', 'concluido', 'descartado');

-- -----------------------------------------------------------------------------
-- Funções de gatilho genéricas
-- -----------------------------------------------------------------------------

-- created_at/created_by são imutáveis; updated_at/updated_by são sempre do servidor.
create function private.tg_carimbo()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.created_at := now();
    new.created_by := coalesce(auth.uid(), new.created_by);
  else
    new.created_at := old.created_at;
    new.created_by := old.created_by;
  end if;
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Usuários e papéis
-- -----------------------------------------------------------------------------
create table public.usuarios (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null,
  email text not null,
  papel public.papel_usuario not null default 'patio',
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);

-- Papel do usuário logado (null se inativo/inexistente). SECURITY DEFINER para não
-- depender das políticas de `usuarios`; fica em `private`, fora da Data API.
create function private.papel_atual()
returns public.papel_usuario
language sql
stable
security definer
set search_path = ''
as $$
  select papel from public.usuarios where id = auth.uid() and ativo
$$;

create function private.tem_papel(variadic papeis public.papel_usuario[])
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(private.papel_atual() = any (papeis), false)
$$;

revoke execute on all functions in schema private from public;
grant execute on function private.papel_atual() to authenticated;
grant execute on function private.tem_papel(public.papel_usuario[]) to authenticated;

-- Cria o perfil quando um usuário é criado no Auth. Nome e papel vêm de
-- app_metadata (só o servidor/admin consegue definir), nunca de user_metadata.
create function private.tg_novo_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.usuarios (id, nome, email, papel)
  values (
    new.id,
    coalesce(new.raw_app_meta_data ->> 'nome', split_part(new.email, '@', 1)),
    new.email,
    coalesce((new.raw_app_meta_data ->> 'papel')::public.papel_usuario, 'patio')
  );
  return new;
end;
$$;

create trigger novo_usuario
  after insert on auth.users
  for each row execute function private.tg_novo_usuario();

-- -----------------------------------------------------------------------------
-- Empresa emitente (linha única) e configurações fiscais
-- -----------------------------------------------------------------------------
create table public.empresas (
  id uuid primary key default gen_random_uuid(),
  razao_social text not null,
  nome_fantasia text,
  cnpj text not null check (cnpj ~ '^\d{14}$'),
  ie text,
  im text,
  -- CRT da NF-e: 1 Simples Nacional, 2 Simples (excesso de sublimite), 3 Regime Normal, 4 MEI
  crt smallint not null default 1 check (crt between 1 and 4),
  cep text check (cep ~ '^\d{8}$'),
  logradouro text,
  numero text,
  complemento text,
  bairro text,
  municipio text,
  codigo_ibge text check (codigo_ibge ~ '^\d{7}$'),
  uf char(2),
  telefone text,
  email text,
  logo_path text,
  nfe_serie integer not null default 1 check (nfe_serie between 0 and 999),
  nfe_proximo_numero integer not null default 1 check (nfe_proximo_numero > 0),
  -- Padrões fiscais EDITÁVEIS — confirmar com o contador. Nada disso é regra fixa no código.
  cfop_interno text not null default '5101',
  cfop_interestadual text not null default '6101',
  csosn text default '102',
  cst_icms text,
  aliquota_icms numeric(5,2) not null default 0,
  cst_pis text not null default '07',
  aliquota_pis numeric(5,2) not null default 0,
  cst_cofins text not null default '07',
  aliquota_cofins numeric(5,2) not null default 0,
  informacoes_complementares text,
  -- Se falso, usuários do pátio não veem valores (R$) nas telas.
  patio_ve_valores boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create unique index empresas_unica on public.empresas ((true));

-- -----------------------------------------------------------------------------
-- Cadastros
-- -----------------------------------------------------------------------------
create table public.fornecedores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  documento text check (documento ~ '^(\d{11}|\d{14})$'),
  ie text,
  telefone text,
  email text,
  cep text check (cep ~ '^\d{8}$'),
  logradouro text,
  numero text,
  bairro text,
  municipio text,
  uf char(2),
  observacoes text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create unique index fornecedores_documento on public.fornecedores (documento) where documento is not null;

create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  razao_social text not null,
  nome_fantasia text,
  documento text not null check (documento ~ '^(\d{11}|\d{14})$'),
  ie text,
  -- indIEDest da NF-e: 1 contribuinte, 2 isento, 9 não contribuinte
  indicador_ie smallint not null default 9 check (indicador_ie in (1, 2, 9)),
  email text,
  telefone text,
  cep text check (cep ~ '^\d{8}$'),
  logradouro text,
  numero text,
  complemento text,
  bairro text,
  municipio text,
  codigo_ibge text check (codigo_ibge ~ '^\d{7}$'),
  uf char(2),
  observacoes text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create unique index clientes_documento on public.clientes (documento);

create table public.motoristas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cpf text check (cpf ~ '^\d{11}$'),
  cnh text,
  telefone text,
  transportadora text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create unique index motoristas_cpf on public.motoristas (cpf) where cpf is not null;

create table public.veiculos (
  id uuid primary key default gen_random_uuid(),
  placa text not null check (placa ~ '^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$'),
  tipo public.tipo_veiculo not null default 'truck',
  tara_kg numeric(12,2) check (tara_kg >= 0),
  uf char(2),
  rntc text,
  motorista_padrao_id uuid references public.motoristas (id) on delete set null,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create unique index veiculos_placa on public.veiculos (placa);
create index veiculos_motorista_padrao on public.veiculos (motorista_padrao_id);

create table public.especies (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  nome_cientifico text,
  conifera boolean not null default false,
  -- NCMs padrão editáveis (confirmar com o contador)
  ncm_serrada text check (ncm_serrada ~ '^\d{8}$'),
  ncm_tora text check (ncm_tora ~ '^\d{8}$'),
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create unique index especies_nome on public.especies (lower(nome));

create table public.qualidades (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  ordem smallint not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create unique index qualidades_ordem on public.qualidades (ordem);

-- Histórico de preços: o vigente é o de maior vigencia_inicio <= hoje.
create table public.tabela_precos (
  id uuid primary key default gen_random_uuid(),
  tipo public.tipo_preco not null,
  especie_id uuid not null references public.especies (id),
  qualidade_id uuid references public.qualidades (id),
  unidade public.unidade_medida not null,
  valor numeric(14,2) not null check (valor >= 0),
  vigencia_inicio date not null default current_date,
  observacao text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  -- venda de serrada é sempre por m³ e com qualidade
  check (tipo = 'compra_tora' or (unidade = 'm3' and qualidade_id is not null))
);
create unique index tabela_precos_vigencia
  on public.tabela_precos (tipo, especie_id, coalesce(qualidade_id, '00000000-0000-0000-0000-000000000000'::uuid), unidade, vigencia_inicio);
create index tabela_precos_qualidade on public.tabela_precos (qualidade_id);

-- -----------------------------------------------------------------------------
-- Compra de toras
-- -----------------------------------------------------------------------------
create table public.entradas_toras (
  id uuid primary key default gen_random_uuid(),
  numero bigint generated always as identity unique,
  especie_id uuid not null references public.especies (id),
  fornecedor_id uuid not null references public.fornecedores (id),
  motorista_id uuid references public.motoristas (id),
  veiculo_id uuid references public.veiculos (id),
  placa text,
  origem text,
  municipio_origem text,
  uf_origem char(2),
  documento_florestal text,
  modo_medicao public.modo_medicao not null,
  -- modo estéreo: dimensões da carga (m)
  carga_comprimento_m numeric(10,3) check (carga_comprimento_m > 0),
  carga_largura_m numeric(10,3) check (carga_largura_m > 0),
  carga_altura_m numeric(10,3) check (carga_altura_m > 0),
  -- modo tonelada (kg)
  peso_bruto_kg numeric(12,2) check (peso_bruto_kg >= 0),
  tara_kg numeric(12,2) check (tara_kg >= 0),
  peso_liquido_kg numeric(12,2) check (peso_liquido_kg >= 0),
  -- quantidade na unidade de compra (st, m³ ou t) e o valor
  quantidade numeric(14,6) not null check (quantidade > 0),
  unidade public.unidade_medida not null,
  valor_unitario numeric(14,2) not null check (valor_unitario >= 0),
  valor_total numeric(14,2) not null check (valor_total >= 0),
  valor_pago numeric(14,2) not null default 0 check (valor_pago >= 0),
  status_pagamento public.status_pagamento not null default 'pendente',
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  check (modo_medicao <> 'estereo' or (carga_comprimento_m is not null and carga_largura_m is not null and carga_altura_m is not null)),
  check (modo_medicao <> 'tonelada' or (peso_bruto_kg is not null and tara_kg is not null))
);
create index entradas_toras_especie on public.entradas_toras (especie_id);
create index entradas_toras_fornecedor on public.entradas_toras (fornecedor_id);
create index entradas_toras_motorista on public.entradas_toras (motorista_id);
create index entradas_toras_veiculo on public.entradas_toras (veiculo_id);
create index entradas_toras_created_at on public.entradas_toras (created_at desc);

-- Toras individuais (modo m³): uma linha pode representar N toras de mesmo diâmetro.
create table public.entradas_toras_itens (
  id uuid primary key default gen_random_uuid(),
  entrada_id uuid not null references public.entradas_toras (id) on delete cascade,
  diametro_cm numeric(8,2) not null check (diametro_cm > 0),
  comprimento_m numeric(8,3) not null check (comprimento_m > 0),
  quantidade integer not null default 1 check (quantidade > 0),
  volume_m3 numeric(14,6) not null check (volume_m3 >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create index entradas_toras_itens_entrada on public.entradas_toras_itens (entrada_id);

create table public.entradas_toras_pagamentos (
  id uuid primary key default gen_random_uuid(),
  entrada_id uuid not null references public.entradas_toras (id) on delete cascade,
  data_pagamento date not null default current_date,
  valor numeric(14,2) not null check (valor > 0),
  forma public.forma_pagamento not null,
  observacao text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create index entradas_toras_pagamentos_entrada on public.entradas_toras_pagamentos (entrada_id);

-- Recalcula valor_pago e status da entrada a cada pagamento lançado/alterado/excluído.
create function private.tg_atualiza_pagamento_entrada()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_entrada uuid := coalesce(new.entrada_id, old.entrada_id);
begin
  update public.entradas_toras e
     set valor_pago = p.total,
         status_pagamento = case
           when p.total <= 0 then 'pendente'
           when p.total >= e.valor_total then 'pago'
           else 'parcial'
         end::public.status_pagamento
    from (select coalesce(sum(valor), 0) as total
            from public.entradas_toras_pagamentos where entrada_id = v_entrada) p
   where e.id = v_entrada;
  return null;
end;
$$;

create trigger atualiza_pagamento_entrada
  after insert or update or delete on public.entradas_toras_pagamentos
  for each row execute function private.tg_atualiza_pagamento_entrada();

-- Estoque de toras: saldo = soma das movimentações por espécie e unidade.
create table public.estoque_toras_mov (
  id uuid primary key default gen_random_uuid(),
  especie_id uuid not null references public.especies (id),
  tipo public.tipo_mov_tora not null,
  quantidade numeric(14,6) not null check (quantidade <> 0),
  unidade public.unidade_medida not null,
  entrada_id uuid references public.entradas_toras (id) on delete cascade,
  producao_id uuid,
  motivo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  check (tipo <> 'ajuste' or motivo is not null)
);
create index estoque_toras_mov_especie on public.estoque_toras_mov (especie_id, unidade);
create index estoque_toras_mov_entrada on public.estoque_toras_mov (entrada_id);
create index estoque_toras_mov_producao on public.estoque_toras_mov (producao_id);

-- -----------------------------------------------------------------------------
-- Estoque de madeira serrada
-- -----------------------------------------------------------------------------
create table public.estoque_itens (
  id uuid primary key default gen_random_uuid(),
  especie_id uuid not null references public.especies (id),
  qualidade_id uuid not null references public.qualidades (id),
  espessura_cm numeric(8,2) not null check (espessura_cm > 0),
  largura_cm numeric(8,2) not null check (largura_cm > 0),
  comprimento_m numeric(8,3) not null check (comprimento_m > 0),
  volume_peca_m3 numeric(14,6) generated always as
    (round((espessura_cm / 100) * (largura_cm / 100) * comprimento_m, 6)) stored,
  saldo_pecas integer not null default 0,
  saldo_m3 numeric(14,6) generated always as
    (round(saldo_pecas * (espessura_cm / 100) * (largura_cm / 100) * comprimento_m, 6)) stored,
  estoque_minimo_pecas integer not null default 0 check (estoque_minimo_pecas >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create unique index estoque_itens_bitola
  on public.estoque_itens (especie_id, qualidade_id, espessura_cm, largura_cm, comprimento_m);
create index estoque_itens_qualidade on public.estoque_itens (qualidade_id);

-- Kardex. O saldo do item é atualizado pelo gatilho abaixo, na mesma transação.
create table public.estoque_mov (
  id uuid primary key default gen_random_uuid(),
  estoque_item_id uuid not null references public.estoque_itens (id),
  tipo public.tipo_mov_estoque not null,
  quantidade integer not null check (quantidade <> 0),
  saldo_apos integer,
  motivo public.motivo_ajuste,
  observacao text,
  -- Saldo negativo só com confirmação explícita do usuário.
  permitir_negativo boolean not null default false,
  producao_id uuid,
  venda_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  check (tipo <> 'ajuste' or motivo is not null)
);
create index estoque_mov_item on public.estoque_mov (estoque_item_id, created_at desc);
create index estoque_mov_producao on public.estoque_mov (producao_id);
create index estoque_mov_venda on public.estoque_mov (venda_id);

create function private.tg_aplica_estoque_mov()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_saldo integer;
begin
  perform set_config('madeireira.mov_estoque', 'on', true);
  -- update ... returning trava a linha do item: movimentações concorrentes ficam em fila.
  update public.estoque_itens
     set saldo_pecas = saldo_pecas + new.quantidade
   where id = new.estoque_item_id
  returning saldo_pecas into v_saldo;

  if v_saldo is null then
    raise exception 'Item de estoque % não encontrado', new.estoque_item_id;
  end if;
  if v_saldo < 0 and not new.permitir_negativo then
    raise exception 'Saldo insuficiente: a movimentação deixaria o estoque em % peças', v_saldo
      using errcode = 'P0001', hint = 'ESTOQUE_NEGATIVO';
  end if;

  perform set_config('madeireira.mov_estoque', 'off', true);
  new.saldo_apos := v_saldo;
  return new;
end;
$$;

-- O saldo do item só muda por movimentação (estoque_mov), nunca editando o item direto.
create function private.tg_protege_saldo()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if coalesce(current_setting('madeireira.mov_estoque', true), 'off') <> 'on'
     and new.saldo_pecas is distinct from (case when tg_op = 'INSERT' then 0 else old.saldo_pecas end) then
    raise exception 'O saldo do estoque só pode ser alterado por movimentação (produção, venda ou ajuste)';
  end if;
  return new;
end;
$$;

create trigger protege_saldo
  before insert or update on public.estoque_itens
  for each row execute function private.tg_protege_saldo();

create trigger aplica_estoque_mov
  before insert on public.estoque_mov
  for each row execute function private.tg_aplica_estoque_mov();

-- Movimentações são imutáveis: correções entram como novo lançamento.
create function private.tg_bloqueia_alteracao()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'Registros de % não podem ser alterados nem excluídos; lance um ajuste', tg_table_name;
end;
$$;

create trigger estoque_mov_imutavel
  before update or delete on public.estoque_mov
  for each row execute function private.tg_bloqueia_alteracao();

-- -----------------------------------------------------------------------------
-- Produção
-- -----------------------------------------------------------------------------
create table public.producoes (
  id uuid primary key default gen_random_uuid(),
  numero bigint generated always as identity unique,
  data_producao date not null default current_date,
  especie_id uuid not null references public.especies (id),
  toras_consumidas_m3 numeric(14,6) check (toras_consumidas_m3 > 0),
  volume_serrado_m3 numeric(14,6) not null default 0,
  total_pecas integer not null default 0,
  -- m³ serrado ÷ m³ de tora × 100
  rendimento_percentual numeric(7,3),
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create index producoes_especie on public.producoes (especie_id);
create index producoes_data on public.producoes (data_producao desc);

create table public.producoes_itens (
  id uuid primary key default gen_random_uuid(),
  producao_id uuid not null references public.producoes (id) on delete cascade,
  estoque_item_id uuid not null references public.estoque_itens (id),
  quantidade integer not null check (quantidade > 0),
  volume_peca_m3 numeric(14,6) not null,
  volume_total_m3 numeric(14,6) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create index producoes_itens_producao on public.producoes_itens (producao_id);
create index producoes_itens_estoque_item on public.producoes_itens (estoque_item_id);

alter table public.estoque_toras_mov
  add constraint estoque_toras_mov_producao_fk foreign key (producao_id) references public.producoes (id) on delete cascade;
alter table public.estoque_mov
  add constraint estoque_mov_producao_fk foreign key (producao_id) references public.producoes (id);

-- -----------------------------------------------------------------------------
-- Vendas e romaneio
-- -----------------------------------------------------------------------------
create table public.vendas (
  id uuid primary key default gen_random_uuid(),
  numero bigint generated always as identity unique,
  cliente_id uuid not null references public.clientes (id),
  motorista_id uuid references public.motoristas (id),
  veiculo_id uuid references public.veiculos (id),
  placa text,
  -- destino da carga (pode diferir do cadastro do cliente)
  destino_cep text check (destino_cep ~ '^\d{8}$'),
  destino_logradouro text,
  destino_numero text,
  destino_complemento text,
  destino_bairro text,
  destino_municipio text,
  destino_codigo_ibge text check (destino_codigo_ibge ~ '^\d{7}$'),
  destino_uf char(2),
  tipo_frete public.tipo_frete not null default 'sem_frete',
  valor_frete numeric(14,2) not null default 0 check (valor_frete >= 0),
  desconto numeric(14,2) not null default 0 check (desconto >= 0),
  total_pecas integer not null default 0,
  total_m3 numeric(14,6) not null default 0,
  valor_produtos numeric(14,2) not null default 0,
  valor_total numeric(14,2) not null default 0,
  status public.status_venda not null default 'rascunho',
  documento_florestal text,
  observacoes text,
  confirmada_em timestamptz,
  entregue_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create index vendas_cliente on public.vendas (cliente_id);
create index vendas_motorista on public.vendas (motorista_id);
create index vendas_veiculo on public.vendas (veiculo_id);
create index vendas_status on public.vendas (status);
create index vendas_created_at on public.vendas (created_at desc);

create table public.vendas_itens (
  id uuid primary key default gen_random_uuid(),
  venda_id uuid not null references public.vendas (id) on delete cascade,
  estoque_item_id uuid not null references public.estoque_itens (id),
  descricao text not null,
  quantidade integer not null check (quantidade > 0),
  volume_m3 numeric(14,6) not null,
  preco_m3 numeric(14,2) not null check (preco_m3 >= 0),
  valor_total numeric(14,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create index vendas_itens_venda on public.vendas_itens (venda_id);
create index vendas_itens_estoque_item on public.vendas_itens (estoque_item_id);

alter table public.estoque_mov
  add constraint estoque_mov_venda_fk foreign key (venda_id) references public.vendas (id);

create table public.romaneios (
  id uuid primary key default gen_random_uuid(),
  numero bigint generated always as identity unique,
  venda_id uuid not null unique references public.vendas (id),
  emitido_em timestamptz not null default now(),
  conferente text,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);

-- -----------------------------------------------------------------------------
-- NF-e
-- -----------------------------------------------------------------------------
create table public.notas_fiscais (
  id uuid primary key default gen_random_uuid(),
  venda_id uuid not null references public.vendas (id),
  romaneio_id uuid references public.romaneios (id),
  ambiente public.ambiente_nfe not null,
  provedor text not null,
  -- referência única enviada ao provedor (idempotência)
  referencia text not null unique,
  numero integer,
  serie integer,
  chave char(44) check (chave ~ '^\d{44}$'),
  protocolo text,
  status public.status_nfe not null default 'rascunho',
  motivo_status text,
  xml_path text,
  danfe_path text,
  autorizada_em timestamptz,
  cancelada_em timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create unique index notas_fiscais_numero on public.notas_fiscais (ambiente, serie, numero) where numero is not null;
create unique index notas_fiscais_chave on public.notas_fiscais (chave) where chave is not null;
create index notas_fiscais_venda on public.notas_fiscais (venda_id);
create index notas_fiscais_romaneio on public.notas_fiscais (romaneio_id);

create table public.nfe_eventos (
  id uuid primary key default gen_random_uuid(),
  nota_id uuid not null references public.notas_fiscais (id),
  tipo public.tipo_evento_nfe not null,
  sequencia smallint not null default 1,
  texto text not null,
  protocolo text,
  status text not null default 'processando',
  motivo_status text,
  xml_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  check (tipo <> 'cancelamento' or char_length(texto) >= 15),
  check (tipo <> 'carta_correcao' or char_length(texto) >= 15)
);
create unique index nfe_eventos_sequencia on public.nfe_eventos (nota_id, tipo, sequencia);

-- Log de chamadas ao provedor (sem token/certificado — sanitizado na aplicação).
create table public.nfe_logs (
  id uuid primary key default gen_random_uuid(),
  nota_id uuid references public.notas_fiscais (id) on delete set null,
  provedor text not null,
  operacao text not null,
  http_status integer,
  sucesso boolean not null,
  request jsonb,
  response jsonb,
  duracao_ms integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create index nfe_logs_nota on public.nfe_logs (nota_id, created_at desc);

-- -----------------------------------------------------------------------------
-- Site público
-- -----------------------------------------------------------------------------
create table public.orcamentos_site (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(nome) between 2 and 120),
  telefone text not null check (char_length(telefone) between 8 and 30),
  email text check (char_length(email) <= 200),
  cidade text check (char_length(cidade) <= 120),
  produto text check (char_length(produto) <= 200),
  mensagem text check (char_length(mensagem) <= 2000),
  status public.status_orcamento not null default 'novo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create index orcamentos_site_status on public.orcamentos_site (status, created_at desc);

-- -----------------------------------------------------------------------------
-- Auditoria
-- -----------------------------------------------------------------------------
create table public.auditoria (
  id bigint generated always as identity primary key,
  tabela text not null,
  registro_id text not null,
  acao text not null check (acao in ('INSERT', 'UPDATE', 'DELETE')),
  usuario_id uuid references auth.users (id) on delete set null,
  dados_antes jsonb,
  dados_depois jsonb,
  created_at timestamptz not null default now()
);
create index auditoria_registro on public.auditoria (tabela, registro_id, created_at desc);
create index auditoria_usuario on public.auditoria (usuario_id, created_at desc);

-- SECURITY DEFINER: grava na auditoria mesmo sem o usuário ter permissão de escrita nela.
create function private.tg_auditoria()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_antes jsonb := case when tg_op <> 'INSERT' then to_jsonb(old) end;
  v_depois jsonb := case when tg_op <> 'DELETE' then to_jsonb(new) end;
begin
  insert into public.auditoria (tabela, registro_id, acao, usuario_id, dados_antes, dados_depois)
  values (
    tg_table_name,
    coalesce(v_depois ->> 'id', v_antes ->> 'id'),
    tg_op,
    auth.uid(),
    v_antes,
    v_depois
  );
  return null;
end;
$$;

-- -----------------------------------------------------------------------------
-- Gatilhos de carimbo e auditoria em todas as tabelas de negócio
-- -----------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'usuarios', 'empresas', 'fornecedores', 'clientes', 'motoristas', 'veiculos', 'especies',
    'qualidades', 'tabela_precos', 'entradas_toras', 'entradas_toras_itens',
    'entradas_toras_pagamentos', 'estoque_toras_mov', 'estoque_itens', 'estoque_mov',
    'producoes', 'producoes_itens', 'vendas', 'vendas_itens', 'romaneios', 'notas_fiscais',
    'nfe_eventos', 'nfe_logs', 'orcamentos_site'
  ] loop
    execute format(
      'create trigger carimbo before insert or update on public.%I
         for each row execute function private.tg_carimbo()', t);
  end loop;

  -- nfe_logs fica de fora da auditoria (já é um log)
  foreach t in array array[
    'usuarios', 'empresas', 'fornecedores', 'clientes', 'motoristas', 'veiculos', 'especies',
    'qualidades', 'tabela_precos', 'entradas_toras', 'entradas_toras_itens',
    'entradas_toras_pagamentos', 'estoque_toras_mov', 'estoque_itens', 'estoque_mov',
    'producoes', 'producoes_itens', 'vendas', 'vendas_itens', 'romaneios', 'notas_fiscais',
    'nfe_eventos', 'orcamentos_site'
  ] loop
    execute format(
      'create trigger auditoria after insert or update or delete on public.%I
         for each row execute function private.tg_auditoria()', t);
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- Visões
-- -----------------------------------------------------------------------------
create view public.estoque_toras_saldo
with (security_invoker = true) as
select especie_id, unidade, sum(quantidade)::numeric(14,6) as saldo
  from public.estoque_toras_mov
 group by especie_id, unidade;

create view public.precos_vigentes
with (security_invoker = true) as
select distinct on (tipo, especie_id, qualidade_id, unidade)
       id, tipo, especie_id, qualidade_id, unidade, valor, vigencia_inicio
  from public.tabela_precos
 where vigencia_inicio <= (now() at time zone 'America/Sao_Paulo')::date
 order by tipo, especie_id, qualidade_id, unidade, vigencia_inicio desc;

-- -----------------------------------------------------------------------------
-- Acesso (Data API) e Row Level Security
-- Papéis: admin (tudo) · escritorio (financeiro/fiscal) · patio (entradas e produção)
-- -----------------------------------------------------------------------------
revoke all on all tables in schema public from anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on public.estoque_toras_saldo, public.precos_vigentes to authenticated;
grant insert on public.orcamentos_site to anon;
revoke insert, update, delete on public.auditoria from authenticated;

do $$
declare
  t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end;
$$;

-- Gera as quatro políticas de uma tabela a partir das listas de papéis.
create function private.criar_politicas(
  p_tabela text,
  p_ler public.papel_usuario[],
  p_gravar public.papel_usuario[],
  p_excluir public.papel_usuario[]
)
returns void
language plpgsql
set search_path = ''
as $$
begin
  execute format(
    'create policy "ler" on public.%I for select to authenticated using ((select private.tem_papel(variadic %L::public.papel_usuario[])))',
    p_tabela, p_ler);
  execute format(
    'create policy "inserir" on public.%I for insert to authenticated with check ((select private.tem_papel(variadic %L::public.papel_usuario[])))',
    p_tabela, p_gravar);
  execute format(
    'create policy "alterar" on public.%I for update to authenticated using ((select private.tem_papel(variadic %L::public.papel_usuario[]))) with check ((select private.tem_papel(variadic %L::public.papel_usuario[])))',
    p_tabela, p_gravar, p_gravar);
  execute format(
    'create policy "excluir" on public.%I for delete to authenticated using ((select private.tem_papel(variadic %L::public.papel_usuario[])))',
    p_tabela, p_excluir);
end;
$$;

do $$
declare
  todos public.papel_usuario[] := '{admin,escritorio,patio}';
  escritorio public.papel_usuario[] := '{admin,escritorio}';
  admin public.papel_usuario[] := '{admin}';
begin
  -- Cadastros: todos leem; pátio também cadastra fornecedor, motorista e veículo na chegada da carga.
  perform private.criar_politicas('fornecedores', todos, todos, escritorio);
  perform private.criar_politicas('motoristas', todos, todos, escritorio);
  perform private.criar_politicas('veiculos', todos, todos, escritorio);
  perform private.criar_politicas('clientes', todos, escritorio, escritorio);
  perform private.criar_politicas('especies', todos, escritorio, admin);
  perform private.criar_politicas('qualidades', todos, escritorio, admin);
  perform private.criar_politicas('tabela_precos', todos, escritorio, escritorio);
  perform private.criar_politicas('empresas', todos, escritorio, admin);

  -- Pátio: entradas de toras e produção
  perform private.criar_politicas('entradas_toras', todos, todos, escritorio);
  perform private.criar_politicas('entradas_toras_itens', todos, todos, escritorio);
  perform private.criar_politicas('estoque_toras_mov', todos, todos, admin);
  perform private.criar_politicas('producoes', todos, todos, escritorio);
  perform private.criar_politicas('producoes_itens', todos, todos, escritorio);
  perform private.criar_politicas('estoque_itens', todos, todos, admin);
  perform private.criar_politicas('estoque_mov', todos, todos, admin);

  -- Financeiro e comercial: escritório; pátio só consulta a carga para conferir
  perform private.criar_politicas('entradas_toras_pagamentos', escritorio, escritorio, escritorio);
  perform private.criar_politicas('vendas', todos, escritorio, escritorio);
  perform private.criar_politicas('vendas_itens', todos, escritorio, escritorio);
  perform private.criar_politicas('romaneios', todos, escritorio, escritorio);

  -- Fiscal
  perform private.criar_politicas('notas_fiscais', escritorio, escritorio, admin);
  perform private.criar_politicas('nfe_eventos', escritorio, escritorio, admin);
  perform private.criar_politicas('nfe_logs', escritorio, escritorio, admin);

  -- Site
  perform private.criar_politicas('orcamentos_site', escritorio, escritorio, escritorio);
end;
$$;

revoke execute on all functions in schema private from public;
grant execute on function private.papel_atual() to authenticated;
grant execute on function private.tem_papel(public.papel_usuario[]) to authenticated;

-- Visitante do site só pode enviar orçamento novo (sem ler nada).
create policy "site envia orcamento" on public.orcamentos_site
  for insert to anon with check (status = 'novo');

-- Usuários: cada um lê o próprio perfil; admin gerencia todos.
create policy "ler" on public.usuarios for select to authenticated
  using (id = (select auth.uid()) or (select private.tem_papel('admin')));
create policy "alterar" on public.usuarios for update to authenticated
  using ((select private.tem_papel('admin')))
  with check ((select private.tem_papel('admin')));
-- Perfis são criados pelo gatilho do Auth; exclusão acontece pela exclusão do usuário no Auth.

-- Auditoria: somente leitura e somente admin.
create policy "ler" on public.auditoria for select to authenticated
  using ((select private.tem_papel('admin')));

-- -----------------------------------------------------------------------------
-- Storage: XML e DANFE das notas (privado) e logo da empresa
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('fiscal', 'fiscal', false, 10485760, array['application/xml', 'text/xml', 'application/pdf']),
  ('empresa', 'empresa', false, 2097152, array['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'])
on conflict (id) do nothing;

create policy "fiscal: escritorio le" on storage.objects for select to authenticated
  using (bucket_id = 'fiscal' and (select private.tem_papel('admin', 'escritorio')));
create policy "fiscal: escritorio envia" on storage.objects for insert to authenticated
  with check (bucket_id = 'fiscal' and (select private.tem_papel('admin', 'escritorio')));
create policy "fiscal: escritorio substitui" on storage.objects for update to authenticated
  using (bucket_id = 'fiscal' and (select private.tem_papel('admin', 'escritorio')))
  with check (bucket_id = 'fiscal' and (select private.tem_papel('admin', 'escritorio')));

create policy "empresa: todos leem" on storage.objects for select to authenticated
  using (bucket_id = 'empresa' and (select private.tem_papel('admin', 'escritorio', 'patio')));
create policy "empresa: escritorio envia" on storage.objects for insert to authenticated
  with check (bucket_id = 'empresa' and (select private.tem_papel('admin', 'escritorio')));
create policy "empresa: escritorio substitui" on storage.objects for update to authenticated
  using (bucket_id = 'empresa' and (select private.tem_papel('admin', 'escritorio')))
  with check (bucket_id = 'empresa' and (select private.tem_papel('admin', 'escritorio')));
create policy "empresa: escritorio remove" on storage.objects for delete to authenticated
  using (bucket_id = 'empresa' and (select private.tem_papel('admin', 'escritorio')));
