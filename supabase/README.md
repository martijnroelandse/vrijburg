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

1. Liturgie: **Opslaan / laden** via `short_id` i.p.v. lange URL-state
2. Nieuwsbrief-pagina: zelfde `short_id` openen → Mailchimp-cards
3. Foto uploaden naar Storage i.p.v. in de link stoppen
