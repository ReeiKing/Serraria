-- Cancelamento de venda (antes da NF-e): as peças voltam ao estoque por estorno.
alter table public.vendas
  add column cancelada_em timestamptz,
  add column motivo_cancelamento text;
