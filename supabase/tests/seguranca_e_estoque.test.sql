-- Testes de banco (pgTAP): `supabase test db`
begin;
create extension if not exists pgtap with schema extensions;
select plan(22);

-- Helpers: assumir a identidade de um usuário do seed
create function pg_temp.logar(p_id uuid) returns void language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', p_id, 'role', 'authenticated')::text, true);
  set local role authenticated;
$$;
create function pg_temp.sair() returns void language sql as $$
  reset role;
  select set_config('request.jwt.claims', '', true);
$$;

-- IDs do seed
\set admin '''00000000-0000-0000-0000-000000000001'''
\set escritorio '''00000000-0000-0000-0000-000000000002'''
\set patio '''00000000-0000-0000-0000-000000000003'''

select is((select papel::text from public.usuarios where id = :admin), 'admin', 'seed cria admin com papel vindo do app_metadata');

-- Dados de apoio (como superusuário)
insert into public.fornecedores (id, nome) values ('10000000-0000-0000-0000-000000000001', 'Fornecedor Teste');
insert into public.clientes (id, razao_social, documento) values ('20000000-0000-0000-0000-000000000001', 'Cliente Teste', '11222333000181');
insert into public.estoque_itens (id, especie_id, qualidade_id, espessura_cm, largura_cm, comprimento_m)
select '30000000-0000-0000-0000-000000000001', e.id, q.id, 1.8, 9, 1.2
  from public.especies e, public.qualidades q where e.nome = 'Pinus' and q.ordem = 1;

select is((select volume_peca_m3 from public.estoque_itens where id = '30000000-0000-0000-0000-000000000001'),
  0.001944::numeric, 'volume da peça 1,8 × 9 × 1,20 = 0,001944 m³');

-- ---------------------------------------------------------------- pátio
select pg_temp.logar(:patio);

select lives_ok($$
  insert into public.entradas_toras (id, especie_id, fornecedor_id, modo_medicao, quantidade, unidade, valor_unitario, valor_total)
  select '40000000-0000-0000-0000-000000000001', id, '10000000-0000-0000-0000-000000000001', 'm3', 10, 'm3', 150, 1500
    from public.especies where nome = 'Pinus'
$$, 'pátio lança entrada de toras');

select is((select created_by from public.entradas_toras where id = '40000000-0000-0000-0000-000000000001'),
  :patio::uuid, 'created_by preenchido com o usuário logado');

select throws_ok($$
  insert into public.clientes (razao_social, documento) values ('X', '11444777000161')
$$, '42501', null, 'pátio não cadastra cliente');

select throws_ok($$
  insert into public.entradas_toras_pagamentos (entrada_id, valor, forma) values ('40000000-0000-0000-0000-000000000001', 100, 'pix')
$$, '42501', null, 'pátio não lança pagamento');

select is((select count(*) from public.notas_fiscais), 0::bigint, 'pátio não enxerga notas fiscais');
select is((select count(*) from public.auditoria), 0::bigint, 'pátio não enxerga auditoria');

update public.usuarios set papel = 'admin' where id = :patio;
select is((select papel::text from public.usuarios where id = :patio), 'patio', 'pátio não promove a si mesmo');

select throws_ok($$
  update public.estoque_itens set saldo_pecas = 999 where id = '30000000-0000-0000-0000-000000000001'
$$, 'P0001', null, 'saldo não pode ser editado direto no item');

select lives_ok($$
  insert into public.estoque_mov (estoque_item_id, tipo, quantidade) values ('30000000-0000-0000-0000-000000000001', 'producao', 100)
$$, 'pátio lança produção no kardex');

select is((select saldo_pecas from public.estoque_itens where id = '30000000-0000-0000-0000-000000000001'), 100, 'saldo atualizado pela movimentação');
select is((select saldo_m3 from public.estoque_itens where id = '30000000-0000-0000-0000-000000000001'), 0.194400::numeric, '100 peças = 0,1944 m³');

select throws_ok($$
  insert into public.estoque_mov (estoque_item_id, tipo, quantidade, motivo) values ('30000000-0000-0000-0000-000000000001', 'ajuste', -150, 'perda')
$$, 'P0001', null, 'bloqueia saldo negativo sem confirmação');

select lives_ok($$
  insert into public.estoque_mov (estoque_item_id, tipo, quantidade, motivo, permitir_negativo) values ('30000000-0000-0000-0000-000000000001', 'ajuste', -150, 'perda', true)
$$, 'permite saldo negativo com confirmação explícita');

select pg_temp.sair();

-- ---------------------------------------------------------------- escritório
select pg_temp.logar(:escritorio);

insert into public.entradas_toras_pagamentos (entrada_id, valor, forma) values ('40000000-0000-0000-0000-000000000001', 500, 'pix');
select is((select status_pagamento::text from public.entradas_toras where id = '40000000-0000-0000-0000-000000000001'), 'parcial', 'pagamento parcial atualiza status');

insert into public.entradas_toras_pagamentos (entrada_id, valor, forma) values ('40000000-0000-0000-0000-000000000001', 1000, 'transferencia');
select is((select status_pagamento::text from public.entradas_toras where id = '40000000-0000-0000-0000-000000000001'), 'pago', 'quitação atualiza status para pago');

select pg_temp.sair();

-- ---------------------------------------------------------------- admin
select pg_temp.logar(:admin);
select ok((select count(*) from public.auditoria where tabela = 'entradas_toras' and usuario_id = :patio::uuid) > 0, 'auditoria registra quem criou');
select throws_ok($$
  delete from public.estoque_mov where estoque_item_id = '30000000-0000-0000-0000-000000000001'
$$, 'P0001', null, 'kardex é imutável (nem o admin exclui)');
select pg_temp.sair();

-- ---------------------------------------------------------------- visitante do site
set local role anon;
select lives_ok($$
  insert into public.orcamentos_site (nome, telefone, mensagem) values ('Visitante', '42999990000', 'Quero 10 m³ de pinus')
$$, 'site grava orçamento');
select throws_ok($$ select * from public.orcamentos_site $$, '42501', null, 'visitante não lê orçamentos');
select throws_ok($$ select * from public.clientes $$, '42501', null, 'visitante não acessa cadastros');
reset role;

select * from finish();
rollback;
