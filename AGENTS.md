# AGENTS.md

## Cursor Cloud specific instructions

### What this repo is
Static, client-side web app (the **Vrijburg Liturgie Generator**, Dutch). There is
**no build step, no bundler, and no package manager** — no `package.json`,
`requirements.txt`, lockfiles, `Makefile`, or `docker-compose`. The `.docx` is
generated entirely in the browser. Nothing needs to be compiled or installed to
develop or run it.

### Frontend apps (all served from the repo root)
- `index.html` — main liturgy form + client-side `.docx` generator.
- `nieuwsbrief.html` — newsletter/Mailchimp "cards" view (shares the same `?id=`).
- `info.html` — informational page.

### Running it (dev)
Serve the repo root over HTTP and open the pages in a browser:
```bash
python3 -m http.server 8000
# http://localhost:8000/index.html
# http://localhost:8000/nieuwsbrief.html
```
- **Must be served over HTTP.** Opening `index.html` as a `file://` URL breaks the
  `fetch()` of `collectes.json` / `dienstplanning.json`. Any static server works.
- **Outbound internet is required at runtime.** The app loads `docx`,
  `@supabase/supabase-js`, `lz-string`, and `jszip` from the jsdelivr CDN. Without
  CDN access the app JS will not run.

### Lint / test / build
There is no lint tooling, no automated test suite, and no build. "Testing" means
serving the site and exercising the form in a browser (e.g. fill in a date/thema
and click **Download liturgie (.docx)**).

### Optional maintenance script (not needed to run the app)
Regenerate `dienstplanning.json` from the bundled CSV (Python 3 stdlib only, no pip
install needed):
```bash
python3 scripts/update-dienstplanning.py dienstplanning-2026.csv
```

### Backend (Supabase) — optional, degrades gracefully
- Cloud save/load (`?id=`), photo upload, and the "liturgie is klaar" email are
  layered on a hosted Supabase project (see `supabase/README.md`). The app works
  without any local backend: it falls back to `localStorage`, long `?z=` links, and
  a `mailto:` link when cloud features/secrets are unavailable.
- The `supabase/functions/meld-klaar` edge function is Deno/TypeScript and only
  sends email when `RESEND_API_KEY` / `RESEND_FROM` / `NOTIFY_EMAIL` secrets are set
  on the Supabase project; otherwise it returns HTTP 501 and the UI uses `mailto:`.
- Frontend Supabase config (URL + anon key) is intentionally hardcoded in
  `index.html`; the anon key is public by design.
