-- Vrijburg: versiegeschiedenis van diensten
-- Uitvoeren in: Supabase Dashboard → SQL Editor → New query → Run
-- (na 001_diensten.sql; veilig om opnieuw te draaien)
--
-- Waarom: een opslag overschrijft het hele record. Op 9 okt 2026 raakte zo de
-- liturgie van 11 oktober (thema, intro, nieuwsbrieftekst) kwijt toen iemand
-- dezelfde ?id= hergebruikte voor 18 oktober. Met deze tabel staat elke
-- opgeslagen versie bewaard en is een overschreven dienst terug te halen.
-- Tegelijk geeft het een tijdlijn per dienst (wie/welke rol, wanneer, welke
-- velden) voor latere analyse.

-- ------------------------------------------------------------
-- 1. Tabel diensten_historie
-- ------------------------------------------------------------
create table if not exists public.diensten_historie (
  id bigint generated always as identity primary key,
  vastgelegd_op timestamptz not null default now(),

  -- 'basis'  = beginstand bij invoeren van deze migratie
  -- 'insert' = nieuwe dienst aangemaakt
  -- 'update' = dienst opgeslagen (rij bevat de stand NA de opslag)
  -- 'delete' = dienst verwijderd (rij bevat de stand VÓÓR verwijderen)
  actie text not null check (actie in ('basis', 'insert', 'update', 'delete')),

  dienst_id uuid not null,          -- diensten.id (geen FK: blijft na delete)
  short_id text,

  -- Volledige stand van de dienst op dat moment
  datum date,
  thema text,
  status text,
  data jsonb,
  foto_path text,
  foto_credit text,

  -- Rol in de app van wie opsloeg (voorganger/organist/medewerker/compleet)
  rol text,
  -- Bij 'update': welke velden zijn gewijzigd t.o.v. de vorige stand
  -- (kolommen + top-level sleutels van data)
  gewijzigde_velden text[]
);

create index if not exists diensten_historie_dienst_idx
  on public.diensten_historie (dienst_id, vastgelegd_op desc);
create index if not exists diensten_historie_short_idx
  on public.diensten_historie (short_id, vastgelegd_op desc);

comment on table public.diensten_historie is
  'Elke opgeslagen versie van een dienst (gevuld door trigger op diensten).';

-- ------------------------------------------------------------
-- 2. Trigger: elke insert/update/delete op diensten vastleggen
-- ------------------------------------------------------------
create or replace function public.log_dienst_historie()
returns trigger
language plpgsql
security definer          -- schrijft ook als anon geen rechten op de tabel heeft
set search_path = public
as $$
declare
  velden text[];
begin
  if tg_op = 'DELETE' then
    insert into public.diensten_historie
      (actie, dienst_id, short_id, datum, thema, status, data, foto_path, foto_credit, rol)
    values
      ('delete', old.id, old.short_id, old.datum, old.thema, old.status, old.data,
       old.foto_path, old.foto_credit, old.data->>'rol');
    return old;
  end if;

  if tg_op = 'UPDATE' then
    select coalesce(array_agg(k order by k), '{}') into velden
    from (
      select key as k
      from jsonb_each(coalesce(new.data, '{}')) n
      full join jsonb_each(coalesce(old.data, '{}')) o using (key)
      where n.value is distinct from o.value
    ) s;
    if new.datum       is distinct from old.datum       then velden := array_append(velden, 'kolom:datum'); end if;
    if new.thema       is distinct from old.thema       then velden := array_append(velden, 'kolom:thema'); end if;
    if new.status      is distinct from old.status      then velden := array_append(velden, 'kolom:status'); end if;
    if new.foto_path   is distinct from old.foto_path   then velden := array_append(velden, 'kolom:foto_path'); end if;
    if new.foto_credit is distinct from old.foto_credit then velden := array_append(velden, 'kolom:foto_credit'); end if;
    -- Niets inhoudelijks gewijzigd (alleen updated_at): niet loggen
    if cardinality(velden) = 0 then
      return new;
    end if;
  end if;

  insert into public.diensten_historie
    (actie, dienst_id, short_id, datum, thema, status, data, foto_path, foto_credit, rol, gewijzigde_velden)
  values
    (lower(tg_op), new.id, new.short_id, new.datum, new.thema, new.status, new.data,
     new.foto_path, new.foto_credit, new.data->>'rol', velden);
  return new;
end;
$$;

drop trigger if exists diensten_historie_log on public.diensten;
create trigger diensten_historie_log
  after insert or update or delete on public.diensten
  for each row execute function public.log_dienst_historie();

-- ------------------------------------------------------------
-- 3. Beginstand: huidige versie van elke bestaande dienst (eenmalig)
-- ------------------------------------------------------------
insert into public.diensten_historie
  (actie, dienst_id, short_id, datum, thema, status, data, foto_path, foto_credit, rol, vastgelegd_op)
select 'basis', d.id, d.short_id, d.datum, d.thema, d.status, d.data,
       d.foto_path, d.foto_credit, d.data->>'rol', d.updated_at
from public.diensten d
where not exists (
  select 1 from public.diensten_historie h where h.dienst_id = d.id
);

-- ------------------------------------------------------------
-- 4. Rechten (prototype, zelfde lijn als diensten)
-- ------------------------------------------------------------
-- Iedereen mag lezen (de inhoud is dezelfde als in diensten, die al publiek
-- leesbaar is). Alleen de trigger schrijft; anon kan historie niet wijzigen
-- of wissen.
alter table public.diensten_historie enable row level security;

drop policy if exists "diensten_historie_select_anon" on public.diensten_historie;
create policy "diensten_historie_select_anon"
  on public.diensten_historie for select
  to anon, authenticated
  using (true);

revoke insert, update, delete on public.diensten_historie from anon, authenticated;
grant select on public.diensten_historie to anon, authenticated;
