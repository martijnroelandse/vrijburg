# Handover: Vrijburg Liturgie Generator

Stand: **september 2026** · Repo: [martijnroelandse/vrijburg](https://github.com/martijnroelandse/vrijburg) · Hosting: GitHub Pages (`main` → root)

---

## 1. Wat is dit?

Statische webapp waarmee Vrijburg Amsterdam de wekelijkse liturgie samenstelt en als printbaar **`.docx`** downloadt. Voorganger, organist en bureau vullen elk hun deel in via **één gedeelde cloud-link** (`?id=…`). Companion-app: **nieuwsbrief** (Mailchimp-cards) op dezelfde `id`.

| | |
|---|---|
| **Live liturgie** | `https://martijnroelandse.github.io/vrijburg/` |
| **Info / gastpredikant** | `…/info.html` (ankers `#gastpredikant`, `#handleiding`, `#privacy`) |
| **Nieuwsbrief** | `…/nieuwsbrief.html?id=<short_id>` |
| **Supabase** | project *Liturgie*, ref `iabrbkirzsolwnuknbel`, regio `eu-west-3` |

Geen build-stap: wijzig `index.html` / JSON, push naar `main`, Pages deployt.

---

## 2. Mensen & rollen

| Wie | Rol in de praktijk |
|---|---|
| **Gigi Calkoen** | Bureau (di–do): datum, planning, links versturen, afronden, `.docx` printen |
| **Gon Homburg** | Liturgiemaker / ontvanger klaar-mails (`gon.homburg@gmail.com`) |
| **ds. Rachelle van Andel / ds. Rosaliene Israël** | Vaste voorgangers |
| **Organisten** | o.a. Jan Pieter Lanooy, Martijn Pranger, … (uit dienstplanning) |
| **Martijn Roelandse** | Onderhoud tool + nieuwsbriefredactie (voorlopig `martijnroelandse@me.com`) |
| **Hiltje** | Vorige handmatige liturgie-maker; feedback in `VERBETERPLAN-FEEDBACK-HILTJE.md` |

**App-rollen** (UI, geen login): `voorganger` · `organist` · `medewerker` · `compleet` (Alles bekijken).

| Rol | Vult in |
|---|---|
| Voorganger | Thema, voorbladtekst, foto+credit, nieuwsbrief, overdenking, orde (lied/lezing/…), lichtlied/slotlied, voorbeden, lied na overdenking |
| Organist | Orgelspel opening/slot, muziek na overdenking, **Muziek**-blokken in de orde |
| Bureau | Datum → planning, collecte, bloemen, agenda; links mailen; `.docx` downloaden; “liturgie is klaar” |
| Alles bekijken | Volledig overzicht + download |

Iedereen met de link kan van rol wisselen of “Toon ook onderdelen van anderen” aanzetten — bewust prototype, geen ACL.

---

## 3. Wekelijkse workflow (bureau)

1. Open de app als **Bureaumedewerk(st)er**, kies de **datum** → predikant, organist, lector, cantorij, kinderkerk, bestuurslid, VL-velden komen uit `dienstplanning.json`.
2. Controleer collecte (auto uit `collectes.json`) en agenda (of import van vrijburg.nl).
3. **Opslaan** → noteer de `id` onderin.
4. Mailen (altijd **dezelfde cloud-dienst**, zelfde `id`):
   - vaste predikant → **Link vaste voorganger**
   - gast → **Brief gastpredikant** (korte mail + link naar `info.html#gastpredikant`)
   - daarna → **Link organist**
5. Als beiden klaar zijn: open die ene link, rol **Alles bekijken**, check, download **`.docx`**, print (liefst veelvoud van 4 pagina’s).
6. Optioneel: **Meld: liturgie is klaar** (status `klaar` + ping met `id` voor nieuwsbrief).

**Ik ben klaar** (voorganger/organist) → mailto naar Gon + `info@vrijburg.nl`, nieuwsbriefredactie in **CC**, met `id` en link naar `nieuwsbrief.html?id=…`. Werkt e-mail niet: **Ik ben klaar – kopieer bericht**.

### Gouden regels

- **Zelfde `id` = zelfde liturgie.** Nooit een tweede dienst starten voor dezelfde zondag als de organist al een andere link heeft — anders moet bureau handmatig overtypen.
- Voorganger zet **`+ Muziek`** waar instrumentale muziek hoort; organist ziet de orde en vult die blokken + orgelspel in.
- Gastpredikant: details (termijnen, downloads, wat invullen) staan op de **infopagina**, niet in de lange mail (Outlook/Mail-limiet ~1800 tekens voor `mailto:`).

---

## 4. Architectuur (kort)

```
Browser (index.html)
  ├── collectes.json / dienstplanning.json / agenda_templates.json  (statisch)
  ├── docx.js + JSZip (CDN) → .docx download
  ├── Supabase Postgres `diensten` + Storage `dienst-fotos`  (?id=short_id)
  └── Edge Function `meld-klaar` → Resend (optioneel) of mailto-fallback

nieuwsbrief.html ──zelfde short_id──► Mailchimp-cards (platte tekst)
```

| Pad | Functie |
|---|---|
| `index.html` | Hele liturgie-app (HTML/CSS/JS) |
| `nieuwsbrief.html` | Mailchimp-cards + podcast-card |
| `info.html` | Handleiding, gastpredikant, privacy |
| `downloads/` | Basisliturgie, declaratie, brief-sjabloon Word |
| `collectes.json` | Collectes seizoen (nu 2026–2027) |
| `dienstplanning.json` | Predikant/organist/lector/… per datum |
| `scripts/update-dienstplanning.py` | CSV/Sheet → JSON |
| `supabase/migrations/001_diensten.sql` | Schema |
| `supabase/functions/meld-klaar/` | Klaar-ping e-mail |
| `.github/workflows/keep-supabase-active.yml` | Ping elke 3 dagen (Free-tier pauze voorkomen) |

Oude lange deel-links `?z=` / `?v=` werken nog als fallback; standaard is `?id=` + `?rol=`.

---

## 5. Configuratie (constanten in `index.html`)

Zoek bovenin het script-blok:

| Constante | Betekenis |
|---|---|
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` | Cloud-backend (anon key = publiek in frontend) |
| `SUPABASE_FOTO_BUCKET` | `dienst-fotos` |
| `LITURGIE_MAKER_EMAIL` | Gon |
| `BUREAU_EMAIL` | `info@vrijburg.nl` |
| `NIEUWSBRIEF_REDACTIE_EMAIL` | Nu Martijn — **vervang door vast redactie-adres** wanneer bekend |
| Vaste liturgieteksten | `BEMOEDIGING_LINES`, `GROET_LINES`, `ONZE_VADER`, `FOOTER`, diaconie/gemeente-teksten, QR-tekst |

RLS: anon mag lezen/schrijven (prototype). Later: auth, edit-tokens, of Edge Function met geheim.

---

## 6. Data bijwerken

### Dienstplanning

Bron: [Google Sheet](https://docs.google.com/spreadsheets/d/1imjMr9ELUHGV9331mYIoTOUc-DizOysV/edit)

```bash
curl -sL "https://docs.google.com/spreadsheets/d/1imjMr9ELUHGV9331mYIoTOUc-DizOysV/export?format=csv" -o dienstplanning.csv
python3 scripts/update-dienstplanning.py dienstplanning.csv
# commit + push dienstplanning.json
```

Kolom **Bestuurslid**: Q3-2026-hulpbestand `downloads/bestuurslid-q3-2026-voor-sheet.tsv` (Sheet desnoods handmatig bijwerken).

### Collectes

`collectes.json`: `type` = **tweede** collecte (`gemeente` / `diaconie` / `bijzonder`), letterlijk gebruikt (geen omkering meer). Eerste collecte = `naam`/`tekst`/`rekening`. Bijzondere 2e: optioneel `c2_naam` / `c2_tekst` / `c2_rekening`; QR → `vrijburg.nl/bijzonderecollecte`.

**Nog te doen:** seizoen **2027–2028** inladen.

### Agenda-templates

`agenda_templates.json` — vaste teksten die bij import/keuze meelopen (o.a. Heilige/Hemelse Bronnen: begeleid door ds. Rachelle).

---

## 7. E-mail & klaar-meldingen

| Actie | Wat gebeurt er |
|---|---|
| Link vaste voorganger / organist | Korte mailto + cloud-link (`?rol=…`) |
| Brief gastpredikant | **Korte** mailto (link, termijnen, lector/organist) + `info.html#gastpredikant`; tekst ook op klembord |
| Ik ben klaar | Mailto Gon + info@, CC nieuwsbrief; `id` + nieuwsbrief-URL |
| Meld nieuwsbriefredactie | Mailto alleen redactie + nieuwsbrieftekst |
| Meld: liturgie is klaar | `status=klaar` + Edge Function Resend, anders mailto-fallback |

`openMailto`: adressen **niet** `%40`-encoden (breekt Outlook). URLs langer dan ~1800 tekens worden standaard geweigerd (Outlook knipt); gastbrief is bewust kort gehouden.

**Resend** (automatische klaar-ping), secrets op project `iabrbkirzsolwnuknbel`:

```bash
supabase secrets set --project-ref iabrbkirzsolwnuknbel \
  RESEND_API_KEY=re_xxx \
  RESEND_FROM="Liturgie Vrijburg <liturgie@vrijburg.nl>" \
  NOTIFY_EMAIL="extra@voorbeeld.nl"
```

Zonder `RESEND_API_KEY` → HTTP 501 → UI opent mailto. Functie is al gedeployed; secrets kunnen nog ontbreken.

---

## 8. Belangrijke technische keuzes

- **Gelijktijdig opslaan:** `mergeStateForSave()` + `baselineState` — alleen in déze sessie gewijzigde velden overschrijven de server; voorkomt dat organist de nieuwsbrief van de dominee wist.
- **Samenwerking voorganger/organist:** sectie 4 toont dienstoverzicht; organist ziet orde (liederen readonly, Muziek bewerkbaar); voorganger ziet orgelvelden.
- **Liedbundels Online:** deeplink + zip-import (platte tekst + muziek 1e couplet). Geen publieke API; niet scrapen. Contact: `info@liedbundelsonline.nl`.
- **Bijbel:** BijbelAPI = Statenvertaling; NBV21 = handmatig via debijbel.nl.
- **Foto:** in Storage + in `.docx`; bij klaar zonder cloud-foto: auto-download + “voeg bijlage toe”.
- **Voorbladlogo** in `.docx`: ~3 cm breed.

---

## 9. Bekende valkuilen

| Symptoom | Oorzaak / oplossing |
|---|---|
| “Opslaan mislukt: Load failed / Failed to fetch” | Supabase Free **gepauzeerd** → Dashboard Restore (`iabrbkirzsolwnuknbel`). Workflow `keep-supabase-active` houdt wakker; GitHub zet scheduled workflows uit na 60 dagen zonder commits — desnoods handmatig **Run workflow**. |
| Dominee-link en organist-mail “passen niet” | Verschillende `id`s gebruikt. Altijd vanuit één opgeslagen dienst mailen. |
| Gastbrief opent niet / alleen link op klembord | Was te lange mailto; opgelost met korte brief + info-pagina (PR #55). |
| Nieuwsbrieftekst “verdwenen” | Oude overwrite-bug; gefixt met merge-on-save. |
| Lokaal `file://` | `collectes.json` fetch faalt — app via Pages of `python3 -m http.server` openen. |
| Firefox “kies een toepassing” bij mailto | Gebruik **Kopieer bericht** / **Kopieer link**. |

---

## 10. Open / later

**Operationeel**

- [ ] Collectes 2027–2028
- [ ] Vast adres `NIEUWSBRIEF_REDACTIE_EMAIL`
- [ ] Resend-domein + secrets voor automatische klaar-ping
- [ ] Google Sheet-kolom Bestuurslid synchroon houden

**Product (niet blokkerend)**

- Live-voorbeeldpaneel vóór `.docx` (Hiltje/Gigi)
- Flexibelere bijzondere diensten (avondmaal, doop, Kerst/Pasen)
- Auth / edit-tokens i.p.v. open anon RLS
- WordPress mediabibliotheek-upload
- Liedbundels autocomplete of officiële API
- Print-hulp “veelvoud van 4 pagina’s”

Gesprekstukken (niet uitvoeren zonder overleg): `LITURGIECIE-19AUG2026.md`, `PLAN-REACTIE-HILTJE-AUG2026.md`, `VERBETERPLAN-FEEDBACK-HILTJE.md`.

---

## 11. Referenties & downloads

| Bestand | Inhoud |
|---|---|
| `downloads/basisliturgie-calibri-mrt2026.docx` | Basisliturgie gastpredikanten |
| `downloads/declaratieformulier-preekbeurt-nov2024.docx` | Declaratie |
| `downloads/brief-gastpredikant.docx` | Word-sjabloon briefpapier (app-mail is korter) |
| `Liturgien/*.docx` | Referentie-opmaak bestaande liturgieën |
| `supabase/README.md` | Schema, bucket, setup |
| `README.md` | Korte gebruikersdoc |

---

## 12. Eerste week checklist voor een opvolger

1. Clone repo, open live URL, maak een testdienst met datum uit de planning.
2. Doorloop rollen voorganger → organist → compleet; check merge-save met twee tabs.
3. Test **Brief gastpredikant** in het mailprogramma dat bureau gebruikt (Mail of Outlook).
4. Open Supabase-dashboard; bevestig tabel `diensten`, bucket, eventueel Restore als pauze.
5. Pas `NIEUWSBRIEF_REDACTIE_EMAIL` aan als er een vast adres is.
6. Lees `info.html#gastpredikant` en de workflow in §3 hierboven.
7. Noteer wie print (Gigi) en wie de `.docx` inhoudelijk checkt (Gon).
