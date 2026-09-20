# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static webapp (no build step, no framework) that Vrijburg Amsterdam uses to compile its weekly church service liturgy and download it as a print-ready `.docx`. There is no server-side code except one Supabase Edge Function. Everything else is plain HTML/CSS/JS files deployed as-is via GitHub Pages.

- Live app: `https://martijnroelandse.github.io/vrijburg/`
- Companion newsletter app: `nieuwsbrief.html?id=<short_id>` (Mailchimp card text, same dataset)
- `info.html`: guide/instructions page for guest preachers, incl. privacy info

## Commands

There is no build/lint/test tooling (no `package.json`). Development is: edit `index.html` / JSON files directly, then serve locally to test.

```bash
# local dev server (index.html fetches JSON via `fetch`, so file:// will not work)
python3 -m http.server

# regenerate dienstplanning.json from the Google Sheet CSV export
curl -sL "https://docs.google.com/spreadsheets/d/1imjMr9ELUHGV9331mYIoTOUc-DizOysV/export?format=csv" -o dienstplanning.csv
python3 scripts/update-dienstplanning.py dienstplanning.csv
# then commit the regenerated dienstplanning.json
```

Deployment is just pushing to `main`; GitHub Pages serves the repo root directly — no CI build step.

## Architecture

```
Browser (index.html)
  ├── collectes.json / dienstplanning.json / agenda_templates.json   (static data, fetched at runtime)
  ├── docx.js + JSZip (CDN, index.html:1171-1174)                    → builds the .docx client-side
  ├── Supabase Postgres table `diensten` + Storage bucket `dienst-fotos`  (?id=<short_id>)
  └── Edge Function `meld-klaar` → Resend (if configured) or mailto fallback

nieuwsbrief.html ──same short_id──► Mailchimp card text (plain text, copy/paste)
```

`index.html` is a single ~4600-line file containing all markup, CSS and JS for the main app — there is no module system or bundler. Key structural landmarks inside it:

- **Config constants** near the top (~line 1180 onward): `SUPABASE_URL`/`SUPABASE_ANON_KEY`, `LITURGIE_MAKER_EMAIL`, `BUREAU_EMAIL`, `NIEUWSBRIEF_REDACTIE_EMAIL`, and the fixed liturgy texts (`BEMOEDIGING_LINES`, `GROET_LINES`, `ONZE_VADER`, `FOOTER`, diaconie/gemeente collection texts, QR text). Edit these directly for content changes — no rebuild needed.
- **`getFormState()` / `applyFormState()`**: the canonical shape of a service's form data; `data` in the Supabase `diensten` table mirrors this (minus `foto_data`, which goes to Storage instead).
- **`mergeStateForSave()` + `baselineState`**: field-level merge logic so that the voorganger (preacher) and organist filling in the same shared `?id=` service concurrently don't overwrite each other's fields — only fields actually changed in *this* browser session are sent on save.
- **`generateDocx()` / `generateDocxAsync()`** (~line 3833+): builds the downloadable `.docx` client-side using the `docx` npm package (loaded via CDN as a UMD global).
- **`openMailto()`**: constructs mailto: links for the various "send link" / "I'm done" actions. Addresses must NOT be `%40`-encoded (breaks Outlook), and URLs are capped around ~1800 chars (Outlook truncates longer mailto bodies) — this is why the guest-preacher letter is deliberately short and defers detail to `info.html#gastpredikant`.
- **Role system** (`ROL_CONFIG`, `setRol()`, `applyRolUI()`): there is no login/auth. Anyone with the link can switch role (`voorganger` / `organist` / `medewerker` / `compleet`) via the UI — this is an intentional prototype tradeoff, not an oversight.
- **URL-based sharing**: current scheme is `?id=<short_id>&rol=<rol>` (Supabase-backed). Legacy long-form `?z=`/`?v=` share links (state encoded via `lz-string`) still decode as a fallback — don't remove that path without checking `decodeShareState()`.

### Data files (edit directly, no build step)

| File | Purpose |
|---|---|
| `collectes.json` | Per-date offering (collecte) info for the season. `type` field is the **second** collection (`gemeente`/`diaconie`/`bijzonder`) and is used verbatim — no inversion. First collection is always the named org (`naam`/`tekst`/`rekening`). A one-off special second collection uses `c2_naam`/`c2_tekst`/`c2_rekening`. |
| `dienstplanning.json` | Per-date roster (predikant/organist/lector/cantorij/kinderkerk/bestuurslid) — generated from `dienstplanning-2026.csv` via `scripts/update-dienstplanning.py`, not hand-edited. |
| `agenda_templates.json` | Fixed boilerplate text attached when importing/selecting certain recurring agenda items. |

### Backend (Supabase project "Liturgie", ref `iabrbkirzsolwnuknbel`, region `eu-west-3`)

- Table `diensten`: `id` (uuid), `short_id`, `datum`, `thema`, `status` (`concept`/`klaar`/`gearchiveerd`), `data` (JSON matching `getFormState()`), `foto_path`, `foto_credit`.
- Storage bucket `dienst-fotos`: public-read, JPEG/PNG/WebP, max 5MB.
- RLS is enabled but `anon` may read/write everything — intentional prototype tradeoff (see `supabase/README.md` §Beveiliging), not a bug to silently "fix".
- Schema lives in `supabase/migrations/001_diensten.sql`; apply manually via the Supabase SQL editor (no migration runner configured).
- `supabase/functions/meld-klaar`: Edge Function that emails a "liturgy ready" ping via Resend when `RESEND_API_KEY` is configured; without it, returns HTTP 501 and the frontend falls back to opening a mailto instead.
- `.github/workflows/keep-supabase-active.yml`: cron every 3 days to ping the Supabase REST endpoint, since the free tier auto-pauses after ~1 week idle. GitHub disables scheduled workflows after 60 days with no commits to the repo — may need a manual "Run workflow" if things go quiet.

## Tooling

- `.claude/skills/impeccable/` (with matching agents in `.claude/agents/impeccable-*.md`) is a third-party frontend-design skill (`npx impeccable install`), invoked as `/impeccable <command>` — e.g. `critique`/`audit` to review `index.html`'s UI, `polish`/`harden` for refinement passes. No `PRODUCT.md`/`DESIGN.md` exist yet, so its first run on this repo will offer `init` to capture product context before doing design work.

## Working conventions

- All UI copy, commit messages, and docs in this repo are in **Dutch**. Match that when editing content or writing commits.
- This is a small internal tool for a handful of named users (see `HANDOVER.md` §2) — prefer direct, pragmatic fixes over generalizing for hypothetical future users.
- `HANDOVER.md` is the canonical, up-to-date project handover doc (roles, weekly workflow, config, known pitfalls, open items) — read it before making non-trivial changes. `README.md` is the short user-facing doc. `LITURGIECIE-19AUG2026.md`, `PLAN-REACTIE-HILTJE-AUG2026.md`, and `VERBETERPLAN-FEEDBACK-HILTJE.md` are discussion/proposal documents — per `HANDOVER.md` §10, don't act on them without prior discussion with the user.
- Config secrets in `index.html` and the GitHub workflow (e.g. `SUPABASE_ANON_KEY`) are intentionally public — it's an anon/publishable key for a client-side app, not a leaked secret.
