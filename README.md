# Vrijburg Liturgie Generator

Webformulier waarmee medewerkers (of dominees zelf) de wekelijkse liturgie kunnen invullen en direct als kant-en-klaar `.docx` downloaden.

## Hoe werkt het?

1. Open `index.html` in een browser (of via de GitHub Pages URL)
2. Vul de dienstgegevens in: datum, voorganger, organist, lector
3. Voeg liederen en lezingen toe in de juiste volgorde
4. Collecte wordt automatisch ingevuld op basis van de datum
5. Klik **Download liturgie (.docx)**

Het gegenereerde document bevat alle vaste teksten (Bemoediging, Groet, Onze Vader, footer) automatisch.

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
- Agenda importeren van vrijburg.nl
- Concept opslaan in de browser (localStorage)

Nog open: collectes 2027-2028, liedboek lookup, bijzondere diensten.
