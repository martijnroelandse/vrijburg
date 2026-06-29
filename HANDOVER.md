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

## Bestandsstructuur

```
├── index.html        # Volledige app (HTML + CSS + JS in één bestand)
├── collectes.json    # Collectes 2026-2027 (55 entries, per datum)
├── README.md         # Gebruikersdocumentatie
└── HANDOVER.md       # Dit bestand
```

---

## Hoe het nu werkt

### Formulier (index.html)

Secties:
1. **Dienst** — datum, voorganger, organist, lector
2. **Thema & beschrijving** — thema, intro-tekst (voor website/nieuwsbrief), foto credit
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

---

## Wat er nog ontbreekt / prioriteiten voor doorontwikkeling

### Hoge prioriteit

**1. Bijbelteksten automatisch ophalen** ✅ *geïmplementeerd*  
Bij type "lezing" in de orde-lijst: knop "Tekst ophalen" die de referentie parseert en de tekst invult via [BijbelAPI](https://www.bijbelapi.com/) (BasisBijbel, vrij beschikbaar).

**2. Emailformulier naar dominee** ✅ *geïmplementeerd*  
Knop "Stuur link naar dominee" opent een pre-ingevulde mailto:-link. Formulierstatus wordt geserialiseerd naar URL-params zodat een gedeelde link de velden pre-invult.

**3. Agenda-import van vrijburg.nl** ✅ *geïmplementeerd*  
Via WordPress REST API: `https://www.vrijburg.nl/wp-json/wp/v2/evenementen` (custom post type met ACF-velden `start` en `locatie`).

**4. Collectes seizoen 2027-2028 bijwerken**  
`collectes.json` dekt 2026-2027. Voor volgend seizoen: vervang of breid het bestand uit. Overweeg een simpel beheerscherm of gewoon het JSON-bestand handmatig bijwerken.

### Lage prioriteit / nice-to-have

- **Opslaan als concept** ✅ *geïmplementeerd* — localStorage zodat een half-ingevuld formulier bewaard blijft bij sluiten
- **Liedboek lookup** — gegeven een lied-nummer, de eerste regel ophalen als titel-suggestie
- **Foto upload** — de dominee stuurt soms een foto mee; die kan nu niet in het .docx (Word-beperking via docx.js is complex), maar een placeholder-blok toevoegen is eenvoudig
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
| Data | collectes.json (statisch bestand) |
| Hosting | GitHub Pages (statisch) |
| Geen | Backend, database, build-tool, npm |

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
