# Vrijburg Liturgie Generator

Webformulier waarmee medewerkers (of dominees zelf) de wekelijkse liturgie kunnen invullen en direct als kant-en-klaar `.docx` downloaden.

## Hoe werkt het?

1. Open de app via GitHub Pages
2. Kies bovenaan uw rol (voorganger, organist, bureaumedewerker)
3. Vul alleen uw eigen onderdeel in — niet alles hoeft tegelijk
4. Deel de link met anderen; uiteindelijk komt alles samen in één .docx

### Typische workflow

1. **Bureaumedewerker** zet datum → predikant, organist, lector en cantorij worden ingevuld vanuit de dienstplanning
2. **Bureaumedewerker** stuurt link naar voorganger en organist
2. **Voorganger** vult thema, foto, nieuwsbrief, overdenking en orde van dienst in, stuurt link terug
3. **Organist** vult orgelspel en muziek in, stuurt link terug
4. **Bureaumedewerker** controleert agenda en collecte, downloadt de liturgie

Zie `HANDOVER.md` voor technische details.

## GitHub Pages deployment

1. Push deze map naar een GitHub repository
2. Ga naar **Settings → Pages → Source: main branch / root**  
   (of zet de bestanden in `/docs` als je meerdere sites hebt)
3. GitHub Pages geeft een URL zoals `https://gebruikersnaam.github.io/repo-naam/liturgie-generator/`

## Bestanden

| Bestand | Beschrijving |
|---|---|
| `index.html` | De volledige applicatie (HTML + CSS + JS) |
| `collectes.json` | Collectes 2026-2027, per datum, met beschrijving en rekeningnummer |
| `dienstplanning.json` | Dienstplanning 2026: predikant, organist, lector, cantorij, kinderkerk per datum |
| `dienstplanning-2026.csv` | Bronbestand voor dienstplanning (export uit Google Sheet) |
| `HANDOVER.md` | Technische documentatie en doorontwikkelingsprioriteiten |
| `README.md` | Dit bestand |

## Collectes bijwerken

`collectes.json` bevat de collectes voor het lopende seizoen. Elk object heeft:

```json
{
  "dag": 7,
  "maand": "Juni",
  "thema": "Vluchtelingen",
  "type": "diaconie",
  "naam": "Stichting U.A.F.",
  "tekst": "Het UAF is een onafhankelijke stichting…",
  "rekening": "NL41 INGB 0000 0763 00 t.n.v. Stichting voor Vluchtelingen-Studenten UAF"
}
```

`type` is de **tweede** collecte (diaconie of gemeente) — de eerste collecte is altijd de genoemde organisatie.

Voor een nieuw seizoen: vervang `collectes.json` met de nieuwe gegevens.

## Vaste teksten aanpassen

De vaste teksten (Bemoediging, Groet, Onze Vader, QR-code tekst, footer) staan bovenin `index.html` als JavaScript-constanten. Die kun je direct bewerken.

## Toekomstige uitbreidingen

Zie `HANDOVER.md` voor de volledige lijst. Recent toegevoegd:

- Bijbelteksten automatisch ophalen bij lezingen (via BijbelAPI)
- Deelbare link en mailto-knop voor dominees
- Cloud-opslag via Supabase (`?id=...`) met knop Opslaan
- Agenda importeren van vrijburg.nl
- Concept opslaan in de browser (localStorage)
- Nieuwsbrief-tekstveld met kopieerknop
- Mailchimp cards-copy als platte tekst (zonder HTML, per card/box)
- Overdenking naar bureau@vrijburg.nl (mailto)
- Foto in liturgie (.docx) + download voor website

Nog open: collectes 2027-2028, liedboek lookup, bijzondere diensten.
