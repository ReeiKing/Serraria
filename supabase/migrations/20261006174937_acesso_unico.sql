-- =============================================================================
-- Acesso único: sem perfis com permissões diferentes. Todo usuário ativo
-- (a secretária que administra o sistema) gerencia tudo. O login continua
-- obrigatório e a auditoria continua registrando quem fez cada alteração.
-- =============================================================================

create function private.usuario_ativo()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.usuarios where id = auth.uid() and ativo)
$$;

revoke execute on function private.usuario_ativo() from public;
grant execute on function private.usuario_ativo() to authenticated;

-- Remove as políticas por papel (tabelas do public e arquivos do Storage)
do $$
declare
  p record;
begin
  for p in select schemaname, tablename, policyname from pg_policies
            where schemaname = 'public'
               or (schemaname = 'storage' and tablename = 'objects'
                   and (policyname like 'fiscal:%' or policyname like 'empresa:%'))
  loop
    execute format('drop policy %I on %I.%I', p.policyname, p.schemaname, p.tablename);
  end loop;
end;
$$;

drop function private.criar_politicas(text, public.papel_usuario[], public.papel_usuario[], public.papel_usuario[]);
drop function private.tem_papel(public.papel_usuario[]);
drop function private.papel_atual();

-- Usuário ativo: acesso total a todas as tabelas de negócio
do $$
declare
  t text;
begin
  for t in select tablename from pg_tables
            where schemaname = 'public' and tablename not in ('auditoria')
  loop
    execute format(
      'create policy "usuario ativo" on public.%I for all to authenticated
         using ((select private.usuario_ativo())) with check ((select private.usuario_ativo()))', t);
  end loop;
end;
$$;

-- Auditoria: só leitura (é gravada pelos gatilhos)
create policy "usuario ativo le" on public.auditoria for select to authenticated
  using ((select private.usuario_ativo()));

-- Visitante do site só pode enviar orçamento novo (sem ler nada)
create policy "site envia orcamento" on public.orcamentos_site
  for insert to anon with check (status = 'novo');

-- Storage: XML/DANFE e logo
create policy "arquivos: usuario ativo le" on storage.objects for select to authenticated
  using (bucket_id in ('fiscal', 'empresa') and (select private.usuario_ativo()));
create policy "arquivos: usuario ativo envia" on storage.objects for insert to authenticated
  with check (bucket_id in ('fiscal', 'empresa') and (select private.usuario_ativo()));
create policy "arquivos: usuario ativo substitui" on storage.objects for update to authenticated
  using (bucket_id in ('fiscal', 'empresa') and (select private.usuario_ativo()))
  with check (bucket_id in ('fiscal', 'empresa') and (select private.usuario_ativo()));
create policy "arquivos: usuario ativo remove" on storage.objects for delete to authenticated
  using (bucket_id = 'empresa' and (select private.usuario_ativo()));

-- Perfis deixam de existir: novos usuários entram como 'admin'.
-- (A coluna/enum ficam para o caso de voltar a separar permissões no futuro.)
alter table public.usuarios alter column papel set default 'admin';
update public.usuarios set papel = 'admin';

create or replace function private.tg_novo_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.usuarios (id, nome, email)
  values (new.id, coalesce(new.raw_app_meta_data ->> 'nome', split_part(new.email, '@', 1)), new.email);
  return new;
end;
$$;

alter table public.empresas drop column patio_ve_valores;
