# Handover: Vrijburg Liturgie Generator

## Wat is dit?

Een statische webapplicatie (GitHub Pages) waarmee medewerkers van Vrijburg Amsterdam de wekelijkse kerkdienst-liturgie kunnen genereren als kant-en-klaar Word-document (`.docx`). Geen server nodig — alles draait in de browser.

**Live URL (na GitHub Pages activeren):**  
`https://<gebruiker>.github.io/<repo>/`

---

## Context

Vrijburg is een vrijzinnig-christelijk centrum in Amsterdam. Elke week wordt er een liturgie-document gemaakt (`.docx`, geprint en uitgedeeld in de kerk). Dat kostte vroeger veel handmatig werk: vaste teksten kopiëren, collecte opzoeken, alles opmaken.

**De twee input-workflows van dominees:**
1. **Gastvoorganger vult zelf in** — Vrijburg stuurt een `basisliturgie.docx` template mee, de dominee stuurt het ingevulde terug (bijv. Petra Galama, 14 juni 2026)
2. **Informele email** — Dominee stuurt een plain-text email met de orde van dienst (bijv. Peter Kattenberg, 26 april 2026: "Lied 213: alle verzen / Lezing: Psalm 23 / ...")

De medewerker (Gon Homburg of Hiltje Wuite-Harmsma) vertaalt dit naar de volledige liturgie.

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
Bij type "lezing" in de orde-lijst: knop "Tekst ophalen" die de referentie parseert en de tekst invult via [BijbelAPI](https://www.bijbelapi.com/) (BasisBijbel, vrij beschikbaar).

**2. Emailformulier naar dominee** ✅ *geïmplementeerd*  
Knop "Stuur link naar dominee" opent een pre-ingevulde mailto:-link. Formulierstatus wordt geserialiseerd naar URL-params zodat een gedeelde link de velden pre-invult.

**3. Agenda-import van vrijburg.nl** ✅ *geïmplementeerd*  
Via WordPress REST API: `https://www.vrijburg.nl/wp-json/wp/v2/evenementen` (custom post type met ACF-velden `start` en `locatie`).

**Voorganger → bureau:** bij "Ik ben klaar" wordt de foto automatisch gedownload; de e-mail bevat instructies om het bestand als bijlage toe te voegen (mailto kan geen bijlagen automatisch meesturen).

**4. Collectes seizoen 2027-2028 bijwerken**  
`collectes.json` dekt 2026-2027. Voor volgend seizoen: vervang of breid het bestand uit. Overweeg een simpel beheerscherm of gewoon het JSON-bestand handmatig bijwerken.

**5. Gedeelde backend (Supabase)** ✅ *schema + liturgie save/load + nieuwsbrief-pagina*  
Liturgie slaat op in tabel `diensten` en deelt via korte link `?id=short_id` (foto in Storage-bucket `dienst-fotos`). Aparte pagina `nieuwsbrief.html` opent dezelfde id en toont Mailchimp-cards (platte tekst, kopieer per card), inclusief optionele card voor de laatste Vrijzinnige Miniatuur (via vrijburg.nl blog + SoundCloud-link), met downloadknop voor de illustratie en copyright/bronvermelding. Oude `?z=`-links blijven als fallback. SQL: `supabase/migrations/001_diensten.sql`.

### Lage prioriteit / nice-to-have

- **Opslaan als concept** ✅ *geïmplementeerd* — localStorage zodat een half-ingevuld formulier bewaard blijft bij sluiten
- **Liedboek Online** — knop opent [liedboek.liedbundels.nu](https://liedboek.liedbundels.nu) en herkent het liednummer. Automatisch downloaden kan niet: inlog + licentie, geen open API. Workflow: zoek op nummer → download liturgie-tekst → plak in formulier. Voor echte koppeling: API-aanvraag bij Kok Boekencentrum / Liedbundels Online.
- **Foto upload** ✅ *geïmplementeerd* — in .docx op voorkant; download voor website. Bij "Ik ben klaar": auto-download + instructie bijlage in e-mail.
- **Nieuwsbrief & overdenking** ✅ *geïmplementeerd* — nieuwsbrief met kopieerknop, inclusief Mailchimp card/box-copy als platte tekst (geen HTML); overdenking via mailto naar `bureau@vrijburg.nl` (niet in .docx)
- **WordPress foto-upload** — direct uploaden naar mediabibliotheek op vrijburg.nl; vereist afstemming met webmaster (Application Password + CORS)
- **Digitale versie** — naast het .docx ook een HTML-versie genereren voor op de website
- **Meerdere diensten per week** — soms zijn er bijzondere diensten (Kerstavond, Pasen) met een afwijkende structuur

---

## Bekende issues / aandachtspunten

- **Tab-uitlijning bemoediging**: de docx.js tab-stops werken maar zijn moeilijk exact te matchen met de originele Word-opmaak. Bij grote afwijkingen: aanpassen via `TabStopPosition` waarden in `beurtzang()`.
- **Liedteksten**: sommige liturgieën bevatten de volledige liedtekst (bijv. lied 773 in de dienst van 14 juni). Dit is optioneel — de dominee voert dit in het tekstgebied in als hij het wil.
- **Bijzondere diensten**: Kerst, Pasen, Pinksteren hebben soms een afwijkende structuur (avondmaal, doopdienst). Overweeg een "bijzondere dienst" toggle.
- **Fetch van collectes.json**: werkt via GitHub Pages (HTTPS). Bij lokaal openen van index.html als `file://` werkt de fetch niet — dan moet `COLLECTES` inline in de JS staan. Oplossing: in de catch-handler de data inline fallback plaatsen.
- **Bijbelvertaling**: de automatische tekstophaling gebruikt de BasisBijbel (bb) via BijbelAPI. Voor andere vertalingen (HSV, Statenvertaling) kan de `BIJBEL_VERSIE`-constante in `index.html` worden aangepast.

---

## Tech stack

| Onderdeel | Technologie |
|---|---|
| Frontend | Vanilla HTML/CSS/JS (geen framework) |
| .docx generatie | [docx](https://docx.js.org/) v8.5.0 via CDN |
| Bijbelteksten | [BijbelAPI](https://www.bijbelapi.com/) (BasisBijbel) |
| Agenda | WordPress REST API (vrijburg.nl) |
| Data | collectes.json (statisch) + Supabase `diensten` (gedeelde opslag) |
| Hosting | GitHub Pages (statisch) |
| Backend | Supabase Free (Postgres + Storage); zie `supabase/` |
| Geen | Build-tool, npm (vooralsnog) |

---

## Referentiebestanden (niet in repo maar beschikbaar)

Deze bestanden staan lokaal bij Martijn en zijn gebruikt als bron:

| Bestand | Inhoud |
|---|---|
| `basisliturgie Calibri mrt2026.docx` | Het Word-template dat Vrijburg meestuurt naar dominees |
| `collectes 2026 - 2027 teksten voor de liturgie.txt` | Bronbestand voor collectes.json |
| `Liturgien/MMDD.docx` | 25 voltooide liturgieën van 2026 als referentie voor opmaak en structuur |
| `Re_ Preekbeurt 26 april 2026 in Vrijburg.eml` | Voorbeeld informele email van dominee (Kattenberg) |
| `gastvoorganger Vrijburg 14 juni.eml` | Voorbeeld email met ingevulde basisliturgie (Galama) |
