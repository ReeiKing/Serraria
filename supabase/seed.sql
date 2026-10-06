-- =============================================================================
-- Seed de DESENVOLVIMENTO (roda em `supabase db reset`). Não use em produção.
-- =============================================================================

-- Espécies (NCMs padrão — confirmar com o contador)
insert into public.especies (nome, nome_cientifico, conifera, ncm_serrada, ncm_tora) values
  ('Pinus', 'Pinus spp.', true, '44071100', '44032100'),
  ('Eucalipto', 'Eucalyptus spp.', false, '44079990', '44039800');

insert into public.qualidades (nome, ordem) values
  ('1ª linha', 1),
  ('2ª linha', 2),
  ('3ª linha', 3);

-- Empresa emitente (dados fictícios — editar em Configurações)
insert into public.empresas (razao_social, nome_fantasia, cnpj, ie, crt, cep, logradouro, numero, bairro, municipio, codigo_ibge, uf, telefone, email)
values ('Serraria Modelo Ltda', 'Serraria Modelo', '00000000000191', 'ISENTO', 1, '84000000', 'Rodovia Exemplo, km 0', 's/n', 'Zona Rural', 'Ponta Grossa', '4119905', 'PR', '4200000000', 'contato@serrariamodelo.com.br');

-- Usuários locais (senha: madeira123). O gatilho cria o perfil em public.usuarios.
do $$
declare
  u record;
begin
  for u in select * from (values
    ('00000000-0000-0000-0000-000000000001'::uuid, 'admin@madeireira.local', 'Administrador', 'admin'),
    ('00000000-0000-0000-0000-000000000002'::uuid, 'escritorio@madeireira.local', 'Escritório', 'escritorio'),
    ('00000000-0000-0000-0000-000000000003'::uuid, 'patio@madeireira.local', 'Pátio', 'patio')
  ) as t(id, email, nome, papel) loop
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated', u.email,
      extensions.crypt('madeira123', extensions.gen_salt('bf')), now(),
      jsonb_build_object('provider', 'email', 'providers', array['email'], 'nome', u.nome, 'papel', u.papel),
      '{}'::jsonb, now(), now(), '', '', '', ''
    );
    insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), u.id, u.id::text,
      jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
      'email', now(), now(), now());
  end loop;
end;
$$;

-- Preços iniciais de exemplo
insert into public.tabela_precos (tipo, especie_id, qualidade_id, unidade, valor, vigencia_inicio)
select 'compra_tora', e.id, null, 'm3', case e.nome when 'Pinus' then 150 else 130 end, current_date
  from public.especies e;

insert into public.tabela_precos (tipo, especie_id, qualidade_id, unidade, valor, vigencia_inicio)
select 'venda_serrada', e.id, q.id, 'm3',
       (case e.nome when 'Pinus' then 1200 else 1100 end) - (q.ordem - 1) * 200, current_date
  from public.especies e cross join public.qualidades q;
