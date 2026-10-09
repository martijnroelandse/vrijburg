# Supabase – Vrijburg diensten

Gedeelde backend voor **liturgie-app** en **nieuwsbrief-app**.

## Project (Liturgie)

| | |
|---|---|
| Project | Liturgie |
| Region | `eu-west-3` (Parijs) |
| URL | `https://iabrbkirzsolwnuknbel.supabase.co` |
| Ref | `iabrbkirzsolwnuknbel` |

Anon/publishable key: **Project Settings → API** (niet de `service_role`).

## Status

Migratie `diensten_schema` is toegepast op het remote project (tabel + bucket + view).

## Eenmalig opzetten (als je opnieuw begint)

1. Open je project in [Supabase Dashboard](https://supabase.com/dashboard)
2. Ga naar **SQL Editor** → **New query**
3. Plak de inhoud van `migrations/001_diensten.sql`
4. Klik **Run**
5. Controleer:
   - **Table Editor** → tabel `diensten`
   - **Storage** → bucket `dienst-fotos`
   - View `diensten_nieuwsbrief`
6. Daarna op dezelfde manier `migrations/002_diensten_historie.sql` (versiegeschiedenis, zie hieronder)

## Datamodel (kort)

### Tabel `diensten`

| Kolom | Betekenis |
|---|---|
| `id` | UUID (intern) |
| `short_id` | Korte ID voor links (`?id=a1b2c3d4`) |
| `datum` | Datum van de dienst |
| `thema` | Thema (ook in Mailchimp-kop) |
| `status` | `concept` / `klaar` / `gearchiveerd` |
| `data` | Volledige formulier-JSON (zonder base64-foto) |
| `foto_path` | Pad in bucket `dienst-fotos` |
| `foto_credit` | Bijschrift foto |

`data` volgt dezelfde velden als `getFormState()` in `index.html`, minus `foto_data`.

### Tabel `diensten_historie` (migratie 002)

Elke opslag van een dienst wordt hier als volledige versie bewaard, door een trigger op `diensten` (de app hoeft er niets voor te doen). Kolommen: dezelfde als `diensten`, plus `actie` (`basis`/`insert`/`update`/`delete`), `vastgelegd_op`, `rol` (rol in de app van wie opsloeg) en `gewijzigde_velden` (welke velden t.o.v. de vorige versie veranderden). Opslaan zonder inhoudelijke wijziging wordt niet gelogd. Anon mag lezen, niet schrijven of wissen.

Een overschreven dienst terughalen (SQL Editor):

```sql
-- tijdlijn van één dienst
select id, vastgelegd_op, actie, datum, thema, rol, gewijzigde_velden
from diensten_historie where short_id = '7e3fc330' order by vastgelegd_op;

-- versie <id> terugzetten
update diensten d set datum = h.datum, thema = h.thema, status = h.status,
  data = h.data, foto_path = h.foto_path, foto_credit = h.foto_credit
from diensten_historie h where h.id = <id> and d.id = h.dienst_id;
```

### Bucket `dienst-fotos`

- Publiek lezen
- JPEG/PNG/WebP, max 5 MB
- Voorbeeldpad: `2026-06-14/hoofdfoto.jpg`

## Beveiliging (prototype)

RLS staat aan, maar **anon mag lezen/schrijven**.  
Dat is bewust voor een snelle interne start. Later aanscherpen met:

- inloggen (Supabase Auth), of
- edit-token per dienst, of
- Edge Function met geheime sleutel

## Volgende stappen in de app

1. ✅ Liturgie: **Opslaan / laden** via `short_id` (`?id=...`) — knop **☁ Opslaan**, en automatisch bij “Mail me de link” / mail-delen
2. ✅ Nieuwsbrief-pagina (`nieuwsbrief.html`): zelfde `short_id` openen → Mailchimp-cards
3. ✅ Foto uploaden naar Storage i.p.v. in de link stoppen

## Gebruik in de liturgie-app

- **☁ Opslaan** — schrijft het formulier naar Supabase
- **🔗 Mail me de link** / mail-knoppen — slaan eerst op, daarna korte link `?id=abcd1234`
- Oude lange `?z=`-links blijven werken als fallback
- Onderin zie je `☁ id=...` als er een cloud-record actief is

## Nieuwsbrief-app

Open `nieuwsbrief.html?id=...` (of via de link in de liturgie-header).  
Toont Mailchimp card-blokken op basis van dezelfde dienst; kopieer per card of alles.

Optioneel: laatste **Vrijzinnige Miniatuur** ophalen van vrijburg.nl (met SoundCloud-luisterlink + leeslink) als aparte card, inclusief illustratie-download en copyright.
