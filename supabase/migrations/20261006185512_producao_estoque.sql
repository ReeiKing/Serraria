-- =============================================================================
-- Produção e estoque: fatores de conversão das toras e estorno de produção.
-- =============================================================================

-- Fatores para converter o estoque de toras para m³ (equivalente).
-- Valores médios de referência — cada serraria deve ajustar à sua realidade.
alter table public.especies
  add column fator_st_m3 numeric(6,4) not null default 0.65 check (fator_st_m3 > 0),
  add column fator_t_m3 numeric(6,4) not null default 1.0 check (fator_t_m3 > 0);

comment on column public.especies.fator_st_m3 is 'm³ sólidos por metro estéreo (empilhado)';
comment on column public.especies.fator_t_m3 is 'm³ por tonelada de tora verde';

update public.especies set fator_t_m3 = 1.15 where nome = 'Pinus';
update public.especies set fator_t_m3 = 0.95 where nome = 'Eucalipto';

-- Estorno de produção (o kardex é imutável: o estorno lança movimentos inversos).
alter table public.producoes
  add column estornada_em timestamptz,
  add column motivo_estorno text;

-- Saldo de toras convertido para m³ por espécie.
create view public.estoque_toras_equivalente
with (security_invoker = true) as
select e.id as especie_id,
       e.nome as especie,
       coalesce(sum(case m.unidade
                      when 'm3' then m.quantidade
                      when 'st' then m.quantidade * e.fator_st_m3
                      when 't' then m.quantidade * e.fator_t_m3
                    end), 0)::numeric(14,6) as saldo_m3
  from public.especies e
  left join public.estoque_toras_mov m on m.especie_id = e.id
 group by e.id, e.nome;

grant select on public.estoque_toras_equivalente to authenticated;
