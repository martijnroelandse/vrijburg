-- Vrijburg: gedeelde opslag voor liturgie + nieuwsbrief
-- Uitvoeren in: Supabase Dashboard → SQL Editor → New query → Run

-- ------------------------------------------------------------
-- 1. Tabel diensten
-- ------------------------------------------------------------
create table if not exists public.diensten (
  id uuid primary key default gen_random_uuid(),

  -- Korte sleutel voor URLs: ?id=a1b2c3d4
  short_id text not null unique
    default substr(replace(gen_random_uuid()::text, '-', ''), 1, 8),

  -- Kernvelden (query/filter + nieuwsbrief-cards)
  datum date,
  thema text,
  status text not null default 'concept'
    check (status in ('concept', 'klaar', 'gearchiveerd')),

  -- Volledige formulierstate (orde van dienst, collecte, agenda, …)
  -- Zelfde vorm als getFormState() in index.html, zonder foto_data.
  data jsonb not null default '{}'::jsonb,

  -- Pad in Storage-bucket dienst-fotos, bv. "2026-06-14/hoofdfoto.jpg"
  foto_path text,
  foto_credit text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists diensten_datum_idx on public.diensten (datum desc);
create index if not exists diensten_status_idx on public.diensten (status);
create index if not exists diensten_data_gin on public.diensten using gin (data);

comment on table public.diensten is
  'Eén record per kerkdienst; gedeeld door liturgie-app en nieuwsbrief-app.';
comment on column public.diensten.short_id is
  'Korte publieke ID voor deellinks (?id=...).';
comment on column public.diensten.data is
  'JSON payload gelijk aan liturgie getFormState(), zonder base64-foto.';

-- updated_at automatisch bijwerken
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists diensten_set_updated_at on public.diensten;
create trigger diensten_set_updated_at
  before update on public.diensten
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- 2. Row Level Security (prototype)
-- ------------------------------------------------------------
-- Let op: anon mag lezen/schrijven. Prima voor interne Vrijburg-prototype.
-- Later aanscherpen met auth / edit-tokens.
alter table public.diensten enable row level security;

drop policy if exists "diensten_select_anon" on public.diensten;
create policy "diensten_select_anon"
  on public.diensten for select
  to anon, authenticated
  using (true);

drop policy if exists "diensten_insert_anon" on public.diensten;
create policy "diensten_insert_anon"
  on public.diensten for insert
  to anon, authenticated
  with check (true);

drop policy if exists "diensten_update_anon" on public.diensten;
create policy "diensten_update_anon"
  on public.diensten for update
  to anon, authenticated
  using (true)
  with check (true);

-- Geen delete voor anon (voorkomt per ongeluk wissen)
drop policy if exists "diensten_delete_authenticated" on public.diensten;
create policy "diensten_delete_authenticated"
  on public.diensten for delete
  to authenticated
  using (true);

-- ------------------------------------------------------------
-- 3. Storage-bucket voor dienstfoto's
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'dienst-fotos',
  'dienst-fotos',
  true,                 -- publiek lezen (nieuwsbrief/Mailchimp)
  5242880,              -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Publiek lezen
drop policy if exists "dienst_fotos_public_read" on storage.objects;
create policy "dienst_fotos_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'dienst-fotos');

-- Anon mag uploaden/overschrijven in deze bucket (prototype)
drop policy if exists "dienst_fotos_anon_insert" on storage.objects;
create policy "dienst_fotos_anon_insert"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'dienst-fotos');

drop policy if exists "dienst_fotos_anon_update" on storage.objects;
create policy "dienst_fotos_anon_update"
  on storage.objects for update
  to anon, authenticated
  using (bucket_id = 'dienst-fotos')
  with check (bucket_id = 'dienst-fotos');

-- ------------------------------------------------------------
-- 4. Handige view voor nieuwsbrief (platte kernvelden)
-- ------------------------------------------------------------
create or replace view public.diensten_nieuwsbrief as
select
  id,
  short_id,
  datum,
  thema,
  status,
  foto_path,
  foto_credit,
  data->>'nieuwsbrief' as nieuwsbrief,
  data->>'intro' as intro,
  data->>'voorganger' as voorganger,
  data->>'organist' as organist,
  data->>'aanvangstijd' as aanvangstijd,
  data->>'agenda_kort' as agenda_kort,
  data->>'agenda_ver' as agenda_ver,
  data->>'c1_thema' as c1_thema,
  data->>'c1_naam' as c1_naam,
  data->>'c1_tekst' as c1_tekst,
  data->>'c2_type' as c2_type,
  updated_at
from public.diensten;

grant select on public.diensten_nieuwsbrief to anon, authenticated;
