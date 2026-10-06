-- Testes de banco (pgTAP): `supabase test db`
begin;
create extension if not exists pgtap with schema extensions;
select plan(24);

-- Helpers: assumir a identidade de um usuário
create function pg_temp.logar(p_id uuid) returns void language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', p_id, 'role', 'authenticated')::text, true);
  set local role authenticated;
$$;
create function pg_temp.sair() returns void language sql as $$
  reset role;
  select set_config('request.jwt.claims', '', true);
$$;

\set secretaria '''00000000-0000-0000-0000-000000000001'''
\set inativo '''00000000-0000-0000-0000-000000000009'''

-- Usuário inativo (para testar o bloqueio)
insert into auth.users (instance_id, id, aud, role, email, raw_app_meta_data)
values ('00000000-0000-0000-0000-000000000000', :inativo, 'authenticated', 'authenticated', 'inativo@madeireira.local', '{"nome": "Inativo"}');
update public.usuarios set ativo = false where id = :inativo;

select is((select nome from public.usuarios where id = :inativo), 'Inativo', 'gatilho cria o perfil com o nome do app_metadata');

-- Dados de apoio (como superusuário)
insert into public.fornecedores (id, nome) values ('f1000000-0000-0000-0000-000000000001', 'Fornecedor Teste');
-- espécie própria do teste para não colidir com os dados de exemplo
insert into public.especies (id, nome) values ('f5000000-0000-0000-0000-000000000001', 'Espécie de teste pgTAP');
insert into public.estoque_itens (id, especie_id, qualidade_id, espessura_cm, largura_cm, comprimento_m)
select 'f3000000-0000-0000-0000-000000000001', 'f5000000-0000-0000-0000-000000000001', q.id, 1.8, 9, 1.2
  from public.qualidades q where q.ordem = 1;

select is((select volume_peca_m3 from public.estoque_itens where id = 'f3000000-0000-0000-0000-000000000001'),
  0.001944::numeric, 'volume da peça 1,8 × 9 × 1,20 = 0,001944 m³');

-- ---------------------------------------------------------------- secretária
select pg_temp.logar(:secretaria);

select lives_ok($$
  insert into public.entradas_toras (id, especie_id, fornecedor_id, modo_medicao, quantidade, unidade, valor_unitario, valor_total)
  select 'f4000000-0000-0000-0000-000000000001', id, 'f1000000-0000-0000-0000-000000000001', 'm3', 10, 'm3', 150, 1500
    from public.especies where nome = 'Pinus'
$$, 'lança entrada de toras');

select is((select created_by from public.entradas_toras where id = 'f4000000-0000-0000-0000-000000000001'),
  :secretaria::uuid, 'created_by preenchido com o usuário logado');

select lives_ok($$
  insert into public.clientes (razao_social, documento) values ('Cliente Teste', '52998224725')
$$, 'cadastra cliente');

insert into public.entradas_toras_pagamentos (entrada_id, valor, forma) values ('f4000000-0000-0000-0000-000000000001', 500, 'pix');
select is((select status_pagamento::text from public.entradas_toras where id = 'f4000000-0000-0000-0000-000000000001'), 'parcial', 'pagamento parcial atualiza status');

insert into public.entradas_toras_pagamentos (entrada_id, valor, forma) values ('f4000000-0000-0000-0000-000000000001', 1000, 'transferencia');
select is((select status_pagamento::text from public.entradas_toras where id = 'f4000000-0000-0000-0000-000000000001'), 'pago', 'quitação atualiza status para pago');

select throws_ok($$
  update public.estoque_itens set saldo_pecas = 999 where id = 'f3000000-0000-0000-0000-000000000001'
$$, 'P0001', null, 'saldo não pode ser editado direto no item');

select lives_ok($$
  insert into public.estoque_mov (estoque_item_id, tipo, quantidade) values ('f3000000-0000-0000-0000-000000000001', 'producao', 100)
$$, 'produção entra no kardex');

select is((select saldo_pecas from public.estoque_itens where id = 'f3000000-0000-0000-0000-000000000001'), 100, 'saldo atualizado pela movimentação');
select is((select saldo_m3 from public.estoque_itens where id = 'f3000000-0000-0000-0000-000000000001'), 0.194400::numeric, '100 peças = 0,1944 m³');

select throws_ok($$
  insert into public.estoque_mov (estoque_item_id, tipo, quantidade, motivo) values ('f3000000-0000-0000-0000-000000000001', 'ajuste', -150, 'perda')
$$, 'P0001', null, 'bloqueia saldo negativo sem confirmação');

select lives_ok($$
  insert into public.estoque_mov (estoque_item_id, tipo, quantidade, motivo, permitir_negativo) values ('f3000000-0000-0000-0000-000000000001', 'ajuste', -150, 'perda', true)
$$, 'permite saldo negativo com confirmação explícita');

select throws_ok($$
  delete from public.estoque_mov where estoque_item_id = 'f3000000-0000-0000-0000-000000000001'
$$, 'P0001', null, 'kardex é imutável');

select ok((select count(*) from public.auditoria where tabela = 'entradas_toras' and usuario_id = :secretaria::uuid) > 0, 'auditoria registra quem criou');

-- produtos vendidos por unidade
insert into public.produtos (id, nome, categoria, preco_venda) values ('f6000000-0000-0000-0000-000000000001', 'Palete de teste pgTAP', 'palete', 50);
select lives_ok($$
  insert into public.produtos_mov (produto_id, tipo, quantidade) values ('f6000000-0000-0000-0000-000000000001', 'producao', 40)
$$, 'produção de paletes entra no kardex de produtos');
select is((select saldo_unidades from public.produtos where id = 'f6000000-0000-0000-0000-000000000001'), 40, 'saldo de produto atualizado pela movimentação');
select throws_ok($$
  update public.produtos set saldo_unidades = 999 where id = 'f6000000-0000-0000-0000-000000000001'
$$, 'P0001', null, 'saldo de produto não pode ser editado direto');
select throws_ok($$
  insert into public.produtos_mov (produto_id, tipo, quantidade, motivo) values ('f6000000-0000-0000-0000-000000000001', 'ajuste', -41, 'perda')
$$, 'P0001', null, 'produto também bloqueia saldo negativo');
select throws_ok($$
  insert into public.vendas_itens (venda_id, descricao, quantidade, volume_m3, unidade, produto_id, estoque_item_id, preco_unitario, valor_total)
  select v.id, 'x', 1, 0, 'UN', 'f6000000-0000-0000-0000-000000000001', 'f3000000-0000-0000-0000-000000000001', 50, 50
    from (select id from public.vendas limit 1) v
$$, '23514', null, 'item de venda é madeira OU produto, nunca os dois');

select pg_temp.sair();

-- ---------------------------------------------------------------- usuário desativado
select pg_temp.logar(:inativo);
select is((select count(*) from public.clientes), 0::bigint, 'usuário desativado não enxerga nada');
select throws_ok($$
  insert into public.fornecedores (nome) values ('X')
$$, '42501', null, 'usuário desativado não grava');
select pg_temp.sair();

-- ---------------------------------------------------------------- visitante do site
set local role anon;
select lives_ok($$
  insert into public.orcamentos_site (nome, telefone, mensagem) values ('Visitante', '42999990000', 'Quero 10 m³ de pinus')
$$, 'site grava orçamento');
select throws_ok($$ select * from public.clientes $$, '42501', null, 'visitante não acessa cadastros');
reset role;

select * from finish();
rollback;
