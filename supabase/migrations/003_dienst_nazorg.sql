-- Preek en feedback van predikanten: bewust NIET in diensten.data, want die
-- tabel is leesbaar voor anon (iedereen met de link). Deze tabel heeft RLS
-- zonder policies: anon kan niets lezen of schrijven. Alleen de Edge Function
-- `nazorg` (service role) schrijft hier; lezen kan via het Supabase-dashboard.
create table if not exists public.dienst_nazorg (
  short_id           text primary key,
  preek              text,
  preek_verstuurd_op timestamptz,
  feedback           jsonb,
  bijgewerkt_op      timestamptz not null default now()
);

alter table public.dienst_nazorg enable row level security;
-- geen policies = geen toegang voor anon/authenticated; service_role omzeilt RLS
