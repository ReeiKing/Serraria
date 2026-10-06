-- =============================================================================
-- Produtos vendidos por unidade (caixotes, paletes PBR, paletes descartáveis…)
-- com estoque próprio em unidades, produção e venda junto com a madeira serrada.
-- =============================================================================

create type public.categoria_produto as enum ('caixote', 'palete', 'outro');

create table public.produtos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  categoria public.categoria_produto not null default 'outro',
  descricao text,
  dimensoes text,
  especie_id uuid references public.especies (id),
  -- NCM sugerido: paletes 4415.20.00, caixotes 4415.10.00 (confirmar com o contador)
  ncm text check (ncm ~ '^\d{8}$'),
  preco_venda numeric(14,2) not null default 0 check (preco_venda >= 0),
  saldo_unidades integer not null default 0,
  estoque_minimo integer not null default 0 check (estoque_minimo >= 0),
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create unique index produtos_nome on public.produtos (lower(nome));
create index produtos_especie on public.produtos (especie_id);

-- Produção (montagem) de produtos
create table public.producoes_produtos (
  id uuid primary key default gen_random_uuid(),
  numero bigint generated always as identity unique,
  data_producao date not null default current_date,
  total_unidades integer not null default 0,
  observacoes text,
  estornada_em timestamptz,
  motivo_estorno text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create index producoes_produtos_data on public.producoes_produtos (data_producao desc);

create table public.producoes_produtos_itens (
  id uuid primary key default gen_random_uuid(),
  producao_id uuid not null references public.producoes_produtos (id) on delete cascade,
  produto_id uuid not null references public.produtos (id),
  quantidade integer not null check (quantidade > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null
);
create index producoes_produtos_itens_producao on public.producoes_produtos_itens (producao_id);
create index producoes_produtos_itens_produto on public.producoes_produtos_itens (produto_id);

-- Kardex dos produtos (mesmas regras do estoque de madeira serrada)
create table public.produtos_mov (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid not null references public.produtos (id),
  tipo public.tipo_mov_estoque not null,
  quantidade integer not null check (quantidade <> 0),
  saldo_apos integer,
  motivo public.motivo_ajuste,
  observacao text,
  permitir_negativo boolean not null default false,
  producao_id uuid references public.producoes_produtos (id),
  venda_id uuid references public.vendas (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  check (tipo <> 'ajuste' or motivo is not null)
);
create index produtos_mov_produto on public.produtos_mov (produto_id, created_at desc);
create index produtos_mov_producao on public.produtos_mov (producao_id);
create index produtos_mov_venda on public.produtos_mov (venda_id);

create function private.tg_aplica_produtos_mov()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_saldo integer;
begin
  perform set_config('madeireira.mov_estoque', 'on', true);
  update public.produtos
     set saldo_unidades = saldo_unidades + new.quantidade
   where id = new.produto_id
  returning saldo_unidades into v_saldo;
  perform set_config('madeireira.mov_estoque', 'off', true);

  if v_saldo is null then
    raise exception 'Produto % não encontrado', new.produto_id;
  end if;
  if v_saldo < 0 and not new.permitir_negativo then
    raise exception 'Saldo insuficiente: a movimentação deixaria o estoque em % unidades', v_saldo
      using errcode = 'P0001', hint = 'ESTOQUE_NEGATIVO';
  end if;
  new.saldo_apos := v_saldo;
  return new;
end;
$$;

create trigger aplica_produtos_mov
  before insert on public.produtos_mov
  for each row execute function private.tg_aplica_produtos_mov();

create trigger produtos_mov_imutavel
  before update or delete on public.produtos_mov
  for each row execute function private.tg_bloqueia_alteracao();

create function private.tg_protege_saldo_produto()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if coalesce(current_setting('madeireira.mov_estoque', true), 'off') <> 'on'
     and new.saldo_unidades is distinct from (case when tg_op = 'INSERT' then 0 else old.saldo_unidades end) then
    raise exception 'O saldo do produto só pode ser alterado por movimentação (produção, venda ou ajuste)';
  end if;
  return new;
end;
$$;

create trigger protege_saldo
  before insert or update on public.produtos
  for each row execute function private.tg_protege_saldo_produto();

-- Itens de venda: madeira serrada (m³) OU produto (unidade)
alter table public.vendas_itens
  alter column estoque_item_id drop not null,
  alter column preco_m3 drop not null,
  add column produto_id uuid references public.produtos (id),
  add column unidade text not null default 'M3' check (unidade in ('M3', 'UN')),
  add column preco_unitario numeric(14,2) check (preco_unitario >= 0),
  add constraint vendas_itens_tipo check (
    (unidade = 'M3' and estoque_item_id is not null and produto_id is null and preco_m3 is not null)
    or (unidade = 'UN' and produto_id is not null and estoque_item_id is null and preco_unitario is not null)
  );
create index vendas_itens_produto on public.vendas_itens (produto_id);

alter table public.vendas add column total_unidades integer not null default 0;

-- Carimbo, auditoria, acesso e RLS nas tabelas novas
do $$
declare
  t text;
begin
  foreach t in array array['produtos', 'producoes_produtos', 'producoes_produtos_itens', 'produtos_mov'] loop
    execute format('create trigger carimbo before insert or update on public.%I for each row execute function private.tg_carimbo()', t);
    execute format('create trigger auditoria after insert or update or delete on public.%I for each row execute function private.tg_auditoria()', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format(
      'create policy "usuario ativo" on public.%I for all to authenticated
         using ((select private.usuario_ativo())) with check ((select private.usuario_ativo()))', t);
  end loop;
end;
$$;
