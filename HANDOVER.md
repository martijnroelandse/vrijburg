# Handover: Vrijburg Liturgie Generator

## Wat is dit?

Een statische webapplicatie (GitHub Pages) waarmee medewerkers van Vrijburg Amsterdam de wekelijkse kerkdienst-liturgie kunnen genereren als kant-en-klaar Word-document (`.docx`). Geen server nodig — alles draait in de browser.

**Live URL (na GitHub Pages activeren):**  
`https://<gebruiker>.github.io/<repo>/`

---

## Context

Vrijburg is een vrijzinnig-christelijk centrum in Amsterdam. Elke week wordt er een liturgie-document gemaakt (`.docx`, geprint en uitgedeeld in de kerk). Dat kostte vroeger veel handmatig werk: vaste teksten kopiëren, collecte opzoeken, alles opmaken.

**De twee input-workflows van dominees:**
1. **Gastvoorganger via de generator** — het bureau stuurt de knop *Brief gastpredikant* (generator-link + downloads van basisliturgie en declaratieformulier). De gast vult in de tool in; het bureau downloadt daarna de `.docx`.
2. **Informele email** — Dominee stuurt een plain-text email met de orde van dienst (bijv. Peter Kattenberg, 26 april 2026: "Lied 213: alle verzen / Lezing: Psalm 23 / ...") — het bureau zet dat in de generator.

De bureaumedewerker (Gigi Calkoen, di–do) rondt af en downloadt de liturgie. Bestanden voor gastpredikanten staan in `downloads/` en op `info.html#gastpredikant`.

---

## Workflow: wie vult wat in?

De liturgie wordt door **meerdere mensen** aangeleverd. In de app kiest ieder bovenaan zijn/haar rol:

| Rol | Verantwoordelijk voor |
|---|---|
| **Voorganger** | Thema, beschrijving liturgie, foto, nieuwsbrief, overdenking (naar bureau), orde van dienst (liederen, lezingen, inleiding), lichtlied en slotlied |
| **Organist** | Orgelspeel (opening en slot), muziek in de orde van dienst |
| **Bureaumedewerker** | Datum, predikant/organist/lector/cantorij/kinderkerk (uit dienstplanning), collecte, bloemen, agenda |
| **Alles bekijken** | Volledig overzicht en download van de .docx |

### Hoe het samenkomt

1. Bureaumedewerker zet datum en stuurt link naar **voorganger** (`?rol=voorganger`)
2. Voorganger vult zijn/haar onderdeel in → klikt **Ik ben klaar** → stuurt link terug
3. Bureaumedewerker stuurt link naar **organist** (`?rol=organist`)
4. Organist vult muziek in → stuurt link terug
5. Bureaumedewerker controleert agenda en collecte, kiest **Alles bekijken**, downloadt .docx

Geen enkel veld is verplicht — ieder vult alleen zijn eigen onderdeel in. De gedeelde link bevat alle reeds ingevulde gegevens; bij terugsturen worden nieuwe invoer samengevoegd.

---

## Bestandsstructuur

```
├── index.html           # Volledige app (HTML + CSS + JS in één bestand)
├── info.html            # Handleiding, gastpredikant-downloads, privacy
├── downloads/           # Basisliturgie, declaratieformulier, brief gastpredikant
├── collectes.json       # Collectes 2026-2027 (55 entries, per datum)
├── dienstplanning.json  # Dienstplanning (predikant, organist, lector, cantorij, etc.)
├── README.md            # Gebruikersdocumentatie
└── HANDOVER.md          # Dit bestand
```

---

## Hoe het nu werkt

### Formulier (index.html)

Secties:
1. **Dienst** — datum, voorganger, organist, lector
2. **Thema, foto & communicatie** — thema, beschrijving liturgie (voorkant .docx), foto-upload (in .docx + download voor website), foto credit, nieuwsbrief (kopieerknop), overdenking (mailto naar bureau@vrijburg.nl)
3. **Opening** — lichtlied, orgelspel opening
4. **Orde van dienst** — dynamische lijst: lied / lezing / inleiding / muziek / overig, in volgorde rangschikken met ↑↓
5. **Afsluiting** — slotlied, orgelspel slot
6. **Collecte & bloemen** — eerste collecte auto-ingevuld op basis van datum (uit collectes.json), tweede collecte (diaconie/gemeente) wisselt automatisch
7. **Agenda** — vrij tekstveld (komende week + verder weg)

### .docx generatie

Gebruikt [`docx`](https://docx.js.org/) v8.5.0 via CDN. De vaste teksten zijn ingebakken als JS-constanten:
- `BEMOEDIGING_LINES` — beurtzang voorganger/gemeente
- `GROET_LINES`
- `ONZE_VADER`
- `DIACONIE_TEKST` / `GEMEENTE_TEKST` + rekeningnummers
- `QR_TEKST` — digitaal collecteren info
- `FOOTER` — "Voorgangers van Vrijburg zijn..."

Font: Calibri, 11pt (conform de huisstijl van de bestaande liturgieën).

### Collectes (collectes.json)

Elk object:
```json
{
  "dag": 14,
  "maand": "Juni",
  "thema": "Vluchtelingen",
  "type": "gemeente",
  "naam": "Stichting NAOMI",
  "tekst": "NAOMI is ontstaan in 2011...",
  "rekening": "DE80 5206 0410 0005 0013 40"
}
```

`type` is de **tweede** collecte. De eerste collecte is altijd de genoemde organisatie.  
Op datum-match wordt de eerste collecte auto-ingevuld; de tweede collecte wisselt automatisch (als eerste = gemeente → tweede = diaconie, en omgekeerd).

### Dienstplanning (dienstplanning.json)

Bron (meest actueel): [Google Spreadsheet dienstplanning](https://docs.google.com/spreadsheets/d/1imjMr9ELUHGV9331mYIoTOUc-DizOysV/edit)  
Statische fallback in repo: `dienstplanning-2026.csv` → `dienstplanning.json`

Bij het kiezen van een datum worden automatisch ingevuld:
- Predikant → voorganger
- Organist, lector (door bureaumedewerker beheerd)
- Cantorij, kinderkerk
- **VLV / VLH / VLZ** — bijzondere dienstvormen (zie hieronder)
- Afwijkende aanvangstijd, bijzondere dienst (feestdag)
- Locatie en overige opmerkingen

### VLV, VLH en VLZ

Drie bijzondere dienstvormen van Vrijburg (logo's in `assets/`):

| Afkorting | Naam | Inhoud |
|---|---|---|
| **VLV** | Vrijburg laat voorgaan | Iemand anders dan de predikant leidt (deel van) de dienst |
| **VLH** | Vrijburg laat horen | Muzikale dienst — concert, cantorij, orgel |
| **VLZ** | Vrijburg laat zien | Visuele dienst — film, tentoonstelling, performance |

In het spreadsheet staan deze in kolommen `VLV`, `VLH`, `VLZ`. Een `?` betekent: gepland maar nog niet definitief.

**Bijwerken (voorkeur — live Google Sheet):**
```bash
curl -sL "https://docs.google.com/spreadsheets/d/1imjMr9ELUHGV9331mYIoTOUc-DizOysV/export?format=csv" -o dienstplanning.csv
python3 scripts/update-dienstplanning.py dienstplanning.csv
```

**Of vanuit meegeleverde CSV (bijv. `dienstplanning-2026.csv`):**
```bash
python3 scripts/update-dienstplanning.py dienstplanning-2026.csv
```

Het 2026-template gebruikt verkorte kolomnamen (`KK`, `VLV`, `VLH`, `VLZ`); het script herkent zowel het oude als het nieuwe formaat.

---

## Wat er nog ontbreekt / prioriteiten voor doorontwikkeling

### Hoge prioriteit

**1. Bijbelteksten automatisch ophalen** ✅ *geïmplementeerd*  
Bij type "lezing" in de orde-lijst: knop "Tekst ophalen (Statenvertaling)" die de referentie parseert en de tekst invult via [BijbelAPI](https://www.bijbelapi.com/) (enige gratis vertaling die de API aanbiedt). Knop "NBV21 openen" ✅ *geïmplementeerd* opent de referentie op debijbel.nl om de tekst handmatig te kopiëren (NBV21 heeft geen gratis API, auteursrecht Nederlands-Vlaams Bijbelgenootschap).

**2. Emailformulier naar dominee** ✅ *geïmplementeerd*  
Knop "Stuur link naar dominee" opent een pre-ingevulde mailto:-link. Formulierstatus wordt geserialiseerd naar URL-params zodat een gedeelde link de velden pre-invult.

**3. Agenda-import van vrijburg.nl** ✅ *geïmplementeerd*  
Via WordPress REST API: `https://www.vrijburg.nl/wp-json/wp/v2/evenementen` (custom post type met ACF-velden `start` en `locatie`).

**Voorganger → bureau:** bij "Ik ben klaar" wordt de foto automatisch gedownload; de e-mail bevat instructies om het bestand als bijlage toe te voegen (mailto kan geen bijlagen automatisch meesturen).

**4. Collectes seizoen 2027-2028 bijwerken**  
`collectes.json` dekt 2026-2027. Voor volgend seizoen: vervang of breid het bestand uit. Overweeg een simpel beheerscherm of gewoon het JSON-bestand handmatig bijwerken.

**5. Gedeelde backend (Supabase)** ✅ *schema + liturgie save/load + nieuwsbrief-pagina*  
Liturgie slaat op in tabel `diensten` en deelt via korte link `?id=short_id` (foto in Storage-bucket `dienst-fotos`). Aparte pagina `nieuwsbrief.html` opent dezelfde id en toont Mailchimp-cards (platte tekst, kopieer per card), inclusief optionele card voor de laatste Vrijzinnige Miniatuur (via vrijburg.nl blog + SoundCloud-link), met downloadknop voor de illustratie en copyright/bronvermelding. Oude `?z=`-links blijven als fallback. SQL: `supabase/migrations/001_diensten.sql`.

**6. Gelijktijdig invullen overschrijft elkaar niet meer** ✅ *geïmplementeerd (aug 2026)*  
Bug: de voorganger en organist krijgen vaak *tegelijk* een link (zie workflow hierboven — stap "Bureaumedewerker stuurt link naar voorganger én organist"). Als beiden de pagina al open hadden vóórdat de ander opsloeg, overschreef `saveDienstToCloud()` de **hele** `data`-kolom met de eigen (deels verouderde) formulierstand — inclusief lege velden die de ander intussen wél had ingevuld. Dit verklaart het symptoom "de nieuwsbrieftekst is verdwenen, terwijl de dominee 'm wel heeft ingevuld": de organist sloeg daarna op met een stand van vóór het invullen van de nieuwsbrief, en die (lege) waarde won.

Oplossing (`index.html`, functies `mergeStateForSave()` en `saveDienstToCloud()`): bij iedere save naar een bestaande dienst wordt eerst de nieuwste stand van de server opgehaald en samengevoegd met de lokale stand — per veld geldt: *alleen* velden die in déze sessie daadwerkelijk zijn gewijzigd (t.o.v. de laatst geladen/opgeslagen `baselineState`) overschrijven de servernaarde; niet-aangeraakte velden krijgen altijd de nieuwste serverwaarde. Zo kunnen voorganger en organist tegelijk in hetzelfde formulier werken zonder elkaars invoer te wissen. `baselineState` wordt bijgewerkt na elke succesvolle load/save.

Beperking: als iemand een veld bewust **leegmaakt** (intentioneel wissen) terwijl een ander tegelijk iets anders invult, wordt die leegmaak-actie wel als "gewijzigd" gezien (baseline had een waarde, nu leeg) en dus doorgevoerd — dat is correct gedrag. Alleen *niet-aangeraakte* velden worden beschermd.

**7. Melding "liturgie is klaar" (e-mail-ping + id)** ✅ *geïmplementeerd (aug 2026)*  
Feedback: er was geen signaal wanneer een liturgie echt compleet was en geen manier om de `id` te achterhalen zonder de link er specifiek bij te zoeken — terwijl die nodig is om de nieuwsbrief (`nieuwsbrief.html?id=...`) te openen.

Nieuwe knop **"📣 Meld: liturgie is klaar"** (zichtbaar voor rol Bureaumedewerker / Alles bekijken, naast de downloadknop):
1. Slaat de dienst op met `status = 'klaar'` (kolom bestond al in `diensten`, werd tot nu toe nooit gezet).
2. Roept de Supabase Edge Function `supabase/functions/meld-klaar` aan (`sb.functions.invoke('meld-klaar', …)`) met `short_id`, datum, thema en de liturgie-/nieuwsbrief-link.
3. Die functie verstuurt een e-mail via de [Resend](https://resend.com) API naar het adres in de secret `NOTIFY_EMAIL`. Vereiste secrets op het Supabase-project (Dashboard → Edge Functions → `meld-klaar` → Secrets, of via CLI):
   ```bash
   supabase secrets set --project-ref iabrbkirzsolwnuknbel \
     RESEND_API_KEY=re_xxx \
     RESEND_FROM="Liturgie Vrijburg <liturgie@vrijburg.nl>" \
     NOTIFY_EMAIL="bureau@vrijburg.nl"
   ```
   (Resend: gratis account, 100 mails/dag; `RESEND_FROM` moet een bij Resend geverifieerd domein zijn — gebruik tijdelijk `onboarding@resend.dev` als testafzender tot dat geregeld is.)
4. **Zolang deze secrets niet zijn ingesteld** antwoordt de functie met `{ ok: false, error: '...' }` (HTTP 501) en valt `index.html` automatisch terug op een kant-en-klare **mailto**-link naar `KLAAR_NOTIFY_EMAIL` (constante bovenin `index.html`, standaard `bureau@vrijburg.nl` — pas aan naar wie de nieuwsbrief maakt). De melding gaat dus in beide gevallen de deur uit; het verschil is alleen automatisch versus één klik op "verstuur" in het eigen mailprogramma.
5. De functie is al gedeployed op het live project (`iabrbkirzsolwnuknbel`) via de Supabase MCP-tool; alleen de secrets ontbreken nog. Testen zonder secrets:
   ```bash
   curl -X POST "https://iabrbkirzsolwnuknbel.supabase.co/functions/v1/meld-klaar" \
     -H "Authorization: Bearer <anon-key>" -H "apikey: <anon-key>" \
     -H "Content-Type: application/json" \
     -d '{"short_id":"test1234","datum":"zondag 1 januari 2027","thema":"Test"}'
   # → {"ok":false,"error":"Niet geconfigureerd: ..."} (HTTP 501) totdat de secrets zijn gezet
   ```

**7b. "Meld nieuwsbriefredactie" direct onder het nieuwsbriefveld** ✅ *geïmplementeerd (aug 2026)*  
Aanleiding: in de praktijk staat de nieuwsbrieftekst niet altijd al klaar op het moment dat de rest van de liturgie compleet is (dat was ook de directe oorzaak van het "ik zie geen nieuwsbrieftekst"-signaal — de tekst was simpelweg nog niet ingevuld, geen bug). Losse melding per veld is dus handiger dan wachten op de algemene "klaar"-melding van de hele dienst.

Nieuwe knop **"📣 Meld nieuwsbriefredactie"** (sectie Thema, foto & communicatie, onder het nieuwsbriefveld): slaat op (`prepareShareLink()`, zodat er een deelbare `id` is) en opent een `mailto:`-link met de nieuwsbrieftekst plus de link, naar het adres in de constante `NIEUWSBRIEF_REDACTIE_EMAIL` bovenin `index.html`. Staat voor nu op `martijnroelandse@me.com` ("voor nu", zoals gevraagd) — pas dit aan naar het definitieve redactie-adres zodra dat bekend is. Gebruikt bewust (nog) geen Edge Function/automatische e-mail: simpele mailto is hier voldoende en werkt zonder verdere configuratie.

De drie oorspronkelijke knoppen "Kopieer voor nieuwsbrief", "Kopieer voor Mailchimp cards" en "Open nieuwsbrief-app" zijn weer verwijderd (aug 2026, feedback: overbodig/verwarrend voor de dominee — de aparte `nieuwsbrief.html`-app met de echte Mailchimp-cards is de bedoelde plek daarvoor). De bijbehorende dode code (`copyField()`, `copyMailchimpCards()`, `collectMailchimpCardsText()`, `openNieuwsbriefPage()` — een verouderde, eenvoudiger duplicaat-implementatie van de cards uit `nieuwsbrief.html`) is verwijderd uit `index.html`. Alleen **"📣 Meld nieuwsbriefredactie"** blijft staan.

### Lage prioriteit / nice-to-have

- **Opslaan als concept** ✅ *geïmplementeerd* — localStorage zodat een half-ingevuld formulier bewaard blijft bij sluiten
- **Liedbundels Online** ([liedbundelsonline.nl](https://liedbundelsonline.nl), gelanceerd juni 2026; vervangt `liedboek.liedbundels.nu`) — knop opent deeplink `/nl/lied/lb-{nummer}` (incl. letter-suffix zoals `23b`). **Zip-import** ✅: bureaumedewerker downloadt een liedlijst (mét “platte tekst”) en klikt **Importeer liedlijst (.zip)**. De app leest `liedlijst-*-tekst.txt` + de JPG’s; zet coupletteksten in het formulier en plaatst de **muziek van het eerste couplet** (eventueel meerdere pagina’s, bijv. antifoon) in het Word-document. Geen publieke API; contact voor koppeling: `info@liedbundelsonline.nl`.
- **Foto upload** ✅ *geïmplementeerd* — in .docx op voorkant; download voor website. Bij "Ik ben klaar": auto-download + instructie bijlage in e-mail.
- **Nieuwsbrief & overdenking** ✅ *geïmplementeerd* — nieuwsbrief met kopieerknop, inclusief Mailchimp card/box-copy als platte tekst (geen HTML); overdenking via mailto naar `bureau@vrijburg.nl` (niet in .docx)
- **WordPress foto-upload** — direct uploaden naar mediabibliotheek op vrijburg.nl; vereist afstemming met webmaster (Application Password + CORS)
- **Digitale versie** — naast het .docx ook een HTML-versie genereren voor op de website
- **Meerdere diensten per week** — soms zijn er bijzondere diensten (Kerstavond, Pasen) met een afwijkende structuur

---

## Feedback van de handmatige liturgie-maker (Hiltje)

Zie `VERBETERPLAN-FEEDBACK-HILTJE.md` voor een puntsgewijze analyse van haar
feedback (juli 2026) — met name over de vaste, niet-zichtbare/niet-bewerkbare
blokken (Gebed na de Groet, Voorbeden, Onze Vader, Uitzending/Zegen) die een
gastvoorganger die van de basisliturgie afwijkt in de weg zitten — en een
gefaseerd verbetervoorstel.

Hiervan zijn inmiddels geïmplementeerd:
- **Sectie "5. Voorbeden"**: vrij tekstveld voor eigen voorbeden/acclamaties
  (`#voorbeden_tekst`) + checkbox om het standaard Onze Vader weg te laten
  (`#geen_onze_vader`). Standaardgedrag (leeg formulier) blijft ongewijzigd.
- **Collecte "Bijzondere collecte"**: derde optie naast Diaconie/Gemeente voor
  een eenmalige bestemming, met eigen naamveld (`#c2_naam`) en een vierde
  QR-code (`DOCX_ASSETS.qrBijzonder` → `assets/collecte_bijzonder.png`,
  verwijst naar de vaste pagina `vrijburg.nl/bijzonderecollecte`).

Nog open (zie verbeterplan): labels verduidelijken, live-voorbeeldpaneel,
gebedsveld bij Opening, Overdenking/Afsluiting als vrije lijst.

## Bekende issues / aandachtspunten

- **Tab-uitlijning bemoediging**: de docx.js tab-stops werken maar zijn moeilijk exact te matchen met de originele Word-opmaak. Bij grote afwijkingen: aanpassen via `TabStopPosition` waarden in `beurtzang()`.
- **Liedteksten**: sommige liturgieën bevatten de volledige liedtekst (bijv. lied 773 in de dienst van 14 juni). Dit is optioneel — de dominee voert dit in het tekstgebied in als hij het wil.
- **Bijzondere diensten**: Kerst, Pasen, Pinksteren hebben soms een afwijkende structuur (avondmaal, doopdienst). Overweeg een "bijzondere dienst" toggle.
- **Fetch van collectes.json**: werkt via GitHub Pages (HTTPS). Bij lokaal openen van index.html als `file://` werkt de fetch niet — dan moet `COLLECTES` inline in de JS staan. Oplossing: in de catch-handler de data inline fallback plaatsen.
- **Bijbelvertaling**: de gratis BijbelAPI biedt momenteel alleen Statenvertaling (`sv`), Canisiusbijbel en De Heilige Schrift 1917 aan (`GET /api/versions`) — géén BasisBijbel en géén NBV21 (auteursrechtelijk beschermd door het Nederlands-Vlaams Bijbelgenootschap, geen gratis API). Knop "Tekst ophalen (Statenvertaling)" gebruikt daarom `sv`. Voor NBV21 opent de knop "NBV21 openen" de juiste referentie op debijbel.nl (boeknaam → OSIS-code via `BIJBELBOEK_OSIS`), waarna de tekst handmatig gekopieerd en geplakt moet worden — vergelijkbaar met de "Liedbundels Online"-knop.

### Verkenning Liedbundels Online (aug 2026)

**Platform:** Laravel-site, sessie-auth (cookies + XSRF). Zoeken (`/nl/lied-zoeken`), liedpagina’s (`/nl/lied/lb-213`), coupletten (`/nl/couplet/lb-213-1`) en liedlijst vereisen inlog. Met `Accept: application/json` geven die routes `401 {"message":"Unauthenticated."}` — er is dus een JSON-backend achter de UI, maar **geen openbare developer-API**.

**Publiek zonder inlog:** catalogus `/nl/bundels/liedboek` (~1386 LB-liederen met nummer + beginregel, bijv. `23b` → "De Heer is mijn herder!"). Sitemap bevat ~16k couplet-URL’s (LB/WK/HH/OTH/GK); de inhoud zelf is achter login.

**Licentie/download (FAQ):** lied toevoegen aan liedlijst → stap 2 voorkeuren → **platte tekst = ja** → zip met `.txt` (alle geselecteerde liederen). Previews hebben watermerk en mogen niet als bron voor liturgie. AV: downloads registreren; na einde licentie mag materiaal niet meer gebruikt worden.

**Wat we wél kunnen (zonder API):**
1. Deeplink naar het juiste lied — geïmplementeerd.
2. **Liedlijst-zip importeren** ✅ — tekst + muziek 1e couplet naar formulier/.docx (aug 2026).
3. Optioneel later: autocomplete op nummer/beginregel uit de **publieke** catalogus.
4. Officiële API/export aanvragen bij `info@liedbundelsonline.nl`.

**Wat we niet moeten doen:** scraping van liedteksten/previews (licentievoorwaarden + geen stabiele API).
- **Supabase-project pauzeert bij inactiviteit** (opgetreden 10 augustus 2026): het gratis Supabase-project pauzeert automatisch na ~1 week zonder API-gebruik. Symptoom in de app: **"Opslaan mislukt: TypeError: Load failed"** (Safari) of "Failed to fetch" (Chrome) bij opslaan/laden/delen via `?id=…`. Herstel: Supabase-dashboard → project → **Restore project** (of via de Supabase MCP-tool `restore_project` met project-ref `iabrbkirzsolwnuknbel`); duurt 1–3 minuten. Preventie: `.github/workflows/keep-supabase-active.yml` doet elke 3 dagen een publieke leesaanvraag om het project actief te houden. Let op: GitHub schakelt scheduled workflows automatisch uit na 60 dagen zonder commits op de repo — bij twijfel de workflow handmatig draaien via **Actions → Houd Supabase-project actief → Run workflow**.

---

## Tech stack

| Onderdeel | Technologie |
|---|---|
| Frontend | Vanilla HTML/CSS/JS (geen framework) |
| .docx generatie | [docx](https://docx.js.org/) v8.5.0 via CDN |
| Bijbelteksten | [BijbelAPI](https://www.bijbelapi.com/) (Statenvertaling) + handmatige NBV21-link naar debijbel.nl |
| Agenda | WordPress REST API (vrijburg.nl) |
| Data | collectes.json (statisch) + Supabase `diensten` (gedeelde opslag) |
| Hosting | GitHub Pages (statisch) |
| Backend | Supabase Free (Postgres + Storage + Edge Functions); zie `supabase/` |
| E-mail-ping "klaar" | Supabase Edge Function `meld-klaar` + [Resend](https://resend.com) API (secrets vereist, zie hierboven); mailto-fallback ingebouwd |
| Geen | Build-tool, npm (vooralsnog) |

---

## Referentiebestanden

Op de site (`downloads/` + `info.html#gastpredikant`):

| Bestand | Inhoud |
|---|---|
| `downloads/basisliturgie-calibri-mrt2026.docx` | Basisliturgie voor gastpredikanten (Calibri, maart 2026) |
| `downloads/declaratieformulier-preekbeurt-nov2024.docx` | Declaratieformulier preekbeurt (nov 2024) |
| `downloads/brief-gastpredikant.docx` | Brief op Vrijburg-briefpapier, afgestemd op de generator (placeholders tussen [haakjes]). Bureau kan dezelfde tekst vanuit de app mailen via *Brief gastpredikant*. |

Lokaal bij Martijn (niet in repo):

| Bestand | Inhoud |
|---|---|
| `collectes 2026 - 2027 teksten voor de liturgie.txt` | Bronbestand voor collectes.json |
| `Liturgien/MMDD.docx` | 25 voltooide liturgieën van 2026 als referentie voor opmaak en structuur |
| `Re_ Preekbeurt 26 april 2026 in Vrijburg.eml` | Voorbeeld informele email van dominee (Kattenberg) |
| `gastvoorganger Vrijburg 14 juni.eml` | Voorbeeld email met ingevulde basisliturgie (Galama) |
