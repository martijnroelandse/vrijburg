# Plan: reactie op feedback Hiltje (augustus 2026)

**Status:** gespreksstuk — nog niets hiervan uitvoeren tot na overleg (liturgiecie woensdag).  
**Bron:** e-mail Hiltje over de liturgiegenerator (“weinig tijdbesparing voor wie de liturgie uiteindelijk samenstelt”).  
**Eerdere lijn:** `VERBETERPLAN-FEEDBACK-HILTJE.md` (juli 2026) — dit document **vervangt die niet**, maar legt een laag *daarboven*: de vraag of de tool de juiste taak oplost.  
**Harde randvoorwaarde (aug 2026):** Hiltje stopt; er is **geen opvolger** met dezelfde affiniteit. Bureaumedewerker Gigi *kan* het, maar heeft geen affiniteit en is er alleen **di–do**. “Alles bij het oude in Word” is dus geen duurzame optie — er móet een werkbare oplossing komen die minder afhankelijk is van één liturgie-specialist.

---

## 1. Wat Hiltje eigenlijk zegt (kern)

Niet: “knopje X is onduidelijk.”  
Wel: **de generator lost het zware werk van B (Hiltje) nauwelijks op**, en dwingt de gastpredikant wél in een digitaal keurslijf. De winst die er is (dienstplanning, collectes, link versturen) weegt voor haar niet op tegen:

1. het resterende handwerk na binnenkomst van predikant/organist (liederen, agenda, **opmaak tot veelvoud van 4 pagina’s**, printen);
2. de leercurve / vragen van gastpredikanten;
3. minder vrijheid dan nu met de basisliturgie-`.docx`.

Rachelles poging (10 augustus) versterkt dat: output was niet bruikbaar genoeg → Hiltje nam de inhoud over en werkte die uit in de basisliturgie.

**Tegelijk:** haar oordeel komt uit de positie van iemand die de huidige handmatige route *wel* beheerst. Voor Gigi (of een willekeurige di–do-kracht) is die route juist het risico: impliciete kennis, opmaakgevoel, liedboek-routines. De tool moet dus niet Hiltje tevreden stellen alsof zij blijft, maar **haar kennis vervangbaar maken** voor iemand zonder die affiniteit.

**Conclusie om eerst te toetsen:** **hoe maken we een liturgie zonder Hiltje, met begrensde vrijheid, die Gigi op di–do aankan?**

---

## 1b. Opvolging & “oneindige vrijheid?”

### Feiten
- Hiltje stopt; geen specialist-opvolger.
- Gigi = capaciteit di–do, geen liturgie-affiniteit → proces moet **kort, voorspelbaar, weinig smaak** vragen.
- Gastpredikanten die “buiten de basisliturgie” gaan, kosten nu juist de meeste tijd (Hiltje’s juli-punt). Zonder specialist worden die uitzonderingen nóg duurder.

### Antwoord op “moeten we oneindige vrijheid cateren?”

**Nee.** Vrijheid tot je een specialist nodig hebt is geen productdoel als die specialist wegvalt.

Praktische lat:

| Niveau | Wat | Voor wie |
|---|---|---|
| **Standaard (default)** | Vaste volgorde + vaste teksten; predikant vult thema, liednummers, lezingen, eventueel nieuwsbrief | 80–90% van de diensten; Gigi rondt af |
| **Beperkt afwijken** | Enkele optionele velden (eigen gebed, voorbeden/acclamatie, bijzondere collecte, geen Onze Vader) — deels al gebouwd | Wie net buiten de standaard wil, zonder vrije compositie |
| **Echte uitzondering** | Doop, avondmaal, heel andere orde, experimentele vorm | **Niet** in de generator forceren: aparte Word-basisliturgie / handmatig — zeldzaam én duurder accepteren |

Oneindige vrijheid in de tool = oneindige UI, oneindige edge cases, en opnieuw een Hiltje nodig om het resultaat te redden. Dat botst met opvolging.

**Productregel om woensdag vast te leggen:**  
*De generator optimaliseert voor de standaarddienst die Gigi kan afronden. Afwijken mag binnen een klein, zichtbaar setje knoppen. Daarbuiten is “niet via de generator” een legitiem antwoord — geen tekortkoming.*

Dat relativeert Hiltje’s keurslijf-kritiek: het keurslijf is **bewust**, omdat de organisatie geen onbeperkte maatwerk-capaciteit meer heeft.

---

## 2. Haar echte workflow (die de app nu deels miskent)

### T−1½ week (donderdag)

Hiltje mailt de **gastpredikant** met drie bijlagen (standaard, per keer aangepast):

| Bestand | Rol |
|---|---|
| Brief gastpredikant | Persoonlijke/aangepaste brief |
| Basisliturgie (`.docx`) | Template om in te vullen / van af te wijken |
| Declaratieformulier | Alleen relevant bij (veel) gasten |

**Eigen predikanten:** géén zo’n mail; zij hebben de basisliturgie al; geen declaratie.  
**Organisten:** bekende gastorganisten kennen het stramien (wel aansporen); nieuwe gastorganist krijgt uitgebreidere mail + basisliturgie; declaratie via Jan Pieter.

### Dinsdag vóór de dienst

Predikant levert inhoud → Hiltje werkt uit:

- liederen uit digitaal liedboek (nu: Liedbundels Online + zip);
- mededelingen & collecten;
- **agenda** — niet alleen inhoud, maar **opmaakhulp** om op een veelvoud van 4 pagina’s uit te komen;
- soms ook collecte-tekstlengte / grootte van 1e-couplet-JPG als opmaakknop.

Daarna: opmaken, afdrukken.

### Wat de generator wél raakt

| Haar stap | Generator nu | Gat |
|---|---|---|
| Mail met brief + basisliturgie + declaratie | Mailto “link naar voorganger/organist” (geen bijlagen, standaardtekst) | **Vervangt haar mail niet echt** |
| Voorblad + rollen | Dienstplanning | ✅ nuttig |
| Collectes + QR | `collectes.json` + vaste QR-assets | ✅ nuttig (QR’s zitten in `assets/`) |
| Orde/inhoud van predikant | Formulier + cloud-link | ⚠️ keurslijf; leerbaarheid |
| Liederen | Zip-import (net gebouwd) | ⚠️ helpt B, niet de predikant-flow |
| Agenda | Import vrijburg.nl | ⚠️ inhoud ja; **pagina-opmaak / 4-blz. nee** |
| Definitieve opmaak & print | `.docx` download | ❌ geen layout-control zoals zij die heeft |

---

## 3. Wat we er wél / niet mee kunnen

### A. Strategische opties (eerst kiezen, dan bouwen)

| Optie | Idee | Past bij opvolging (Gigi)? |
|---|---|---|
| **A1 — Tool voor B, niet voor gastpredikant** | Predikant levert Word/e-mail; B importeert (lied-zip, agenda, collectes) en downloadt `.docx` | ✅ minder predikant-leercurve; Gigi doet vaste afronding |
| **A2 — Hybride** | Vaste predikanten → generator; gasten → pack óf simpel formulier; B rondt af | ✅ beste balans; gasten niet forceren, vaste predikanten wel standaardiseren |
| **A3 — Generator als enige pad + max flexibiliteit** | Iedereen in formulier; grote vrijheid (vrije lijsten overal) | ❌ maximaliseert uitzonderingen; vraagt juist specialist |
| **A3′ — Generator als enige pad + begrensde vrijheid** | Iedereen in formulier; standaard streng; uitzonderingen beperkt of “buiten tool” | ✅ kan, als UX voor predikant *eenvoudig* blijft |
| **A4 — Pauzeren** | Alleen onderhoud | ❌ geen antwoord op Hiltje-stop |

**Aanbeveling om woensdag voor te leggen:** **A2 of A3′**, niet A3-maximaal-vrij.

Gemeenschappelijke kern van A2/A3′:
- **Primaire gebruiker van de afronding = Gigi (di–do)**, niet Hiltje.
- **Standaarddienst = happy path**; afwijken = klein setje opties of “handmatig buiten de tool”.
- Gastpredikant-pack (brief + basisliturgie + declaratie) mag blijven als *intake*, zolang B de inhoud daarna in de generator kan zetten zonder Hiltje-niveau opmaak.
- Investeer in wat Gigi tijd kost / fouten voorkomt: planning, collectes, **lied-zip**, heldere checklist, printklare `.docx` die “goed genoeg” is — niet in oneindige compositievrijheid.

Hiltje’s punt “weinig tijdbesparing voor míj” is dan deels waar én deels naast de kwestie: de tool hoeft haar ambacht niet te evenaren; die moet **haar rol overbodig maken binnen acceptabele kwaliteit**.

### B. Concrete bouwrichtingen — alleen zinvol *na* keuze A

Gesorteerd op “past op Gigi’s afronding” vs. “detail dat Hiltje bewust parkeert”.

#### B1 — Hoge relevantie voor afronding zonder specialist

1. **Liedlijst-zip → tekst + muziek 1e couplet in `.docx`**  
   Status: recent gebouwd. Past precies op “invullen liederen uit digitaal liedboek”.  
   Nog te toetsen: is de opmaak bruikbaar genoeg voor print zonder Word-tweaken?

2. **Pagina-opmaak / “veelvoud van 4”**  
   Opties (van licht naar zwaar):  
   - live **paginaschatting** (“nu ~X blz.”) + tips (agenda inkorten/verlengen);  
   - agenda-sectie met **vulregels / witruimte**;  
   - echte WYSIWYG-layout in Word-kwaliteit (groot; waarschijnlijk **niet** in browser-docx te evenaren).  
   **Eerlijk advies:** Hiltjes layout-niveau evenaren beloven we niet. Wel: Gigi moet zonder “opmaakgevoel” tot een acceptabele print komen — desnoods vaste lengte/agenda-regels i.p.v. fijnproeverij.

3. **Startmail gastpredikant met bijlagen**  
   Generator kan géén echte bijlagen in `mailto:` zetten. Wel:  
   - knop “Stel gastpredikant-mail samen” (subject/body + checklist);  
   - downloads van de drie standaardbestanden;  
   - optioneel later: Edge Function + Resend mét bijlagen.  

4. **Modus “eigen predikant” vs “gast”**  
   Verbergt declaratie/brief-stappen; past bij het onderscheid in aanloop.

5. **Checklist / runbook voor Gigi (di–do)**  
   Niet alleen software: één A4 “van datum tot print” zodat affiniteit minder nodig is.

#### B2 — Secundair (alleen als predikanten in-tool blijven)

Uit juli-plan, begrensd gehouden:

- live-voorbeeldpaneel (zichtbaarheid vóór download) — **wel** nuttig voor Gigi;
- optionele velden die al bestaan uitbreiden/helder maken;
- **niet** meteen Overdenking/Afsluiting als volledig vrije compositorische lijsten (dat is A3-maximaal-vrij).

#### B3 — Bewust parkeren

Lettertypen, logo-grootte, mailtekst-polish, “nutteloze” Liedboek-deeplinks — ná strategisch besluit, niet de woensdag-kern.

#### B4 — Non-goals

- Oneindige compositievrijheid in de tool.  
- Pixel-perfecte kopie van Hiltjes Word.  
- Automatisch altijd N×4 pagina’s zonder menselijke keuzes.  
- Pauzeren tot er weer een specialist is.

---

## 4. Antwoorden op haar feitelijke vragen (kort)

**“Waar komen de QR-codes vandaan?”**  
Vaste PNG’s in de repo (`assets/collecte*.png`), gekoppeld aan vrijburg.nl-collectepagina’s.

**“Vervangt de link-mail mijn mail met bijlagen?”**  
Nee. Alleen cloud-link. Brief/basisliturgie/declaratie zitten er niet in.

**“Blijft het werk van B na download bestaan?”**  
Deels ja — maar dat werk moet **Gigi-proof** worden (lied-zip, checklist, goed-genoeg-docx), niet Hiltje-niveau ambacht blijven.

**“Rachelles download van 10 augustus”**  
Te vroeg als eindoordeel; wel signaal dat “goed genoeg om te printen” expliciet moet worden afgesproken door de liturgiecie.

---

## 5. Voorstel voor de liturgiecie (woensdag)

### Doel van het gesprek

Niet feature-lijstjes afvinken, maar twee besluiten:

1. **Opvolging:** afronding = Gigi (di–do); wat mag zij *niet* hoeven kunnen?  
2. **Vrijheid:** standaard streng + begrensd afwijken — ja of nee?

### Voorgestelde stellingen

1. Zonder Hiltje is handmatige Word-opmaak als *enige* pad te kwetsbaar.  
2. De generator optimaliseert voor de **standaarddienst**; oneindige vrijheid cateren we niet.  
3. Gastpredikant-pack mag blijven als *aanlevering*; print/afronding via generator.  
4. Echte uitzonderingen = handmatig / apart — zeldzaam accepteren.  
5. “Goed genoeg” = liturgiecie-besluit; daarna niet meer terugvallen op “Hiltje tipt het over in Word”.

### Doorsturen naar predikanten?

Eerst liturgiecie; daarna korte samenvatting met **opvolgingsboodschap**: we standaardiseren zodat het werk zonder Hiltje door kan — niet “de tool is nog niet flexibel genoeg”.

---

## 6. Als we wél gaan bouwen — voorgestelde volgorde

Alleen starten na akkoord op §5.

| Fase | Wat | Waarom |
|---|---|---|
| **0** | Positionering in README/`info.html` + Gigi-runbook | Verwachtingen + opvolging |
| **1** | Gastpredikant-startpakket (templates + mailhulp) | Aanloop zonder Hiltje |
| **2** | Lied-zip hard maken (opmaak “goed genoeg” voor print) | Grootste resterende B-werk |
| **3** | Lichte pagina-hulp / vaste printconventies | Minder opmaak-affiniteit nodig |
| **4** | Zichtbaarheid (voorbeeldpaneel) + begrensde optionele velden | Leerbaarheid zonder max-vrijheid |

---

## 7. Bewuste non-goals (nu)

- Oneindige vrijheid / volledige vrije liturgie-compositor.  
- Pixel-perfecte kopie van de Word-basisliturgie.  
- Automatisch “altijd N×4 pagina’s”.  
- Grote polish-ronde vóór strategisch besluit.  
- A4 (pauzeren) als antwoord op Hiltje-stop.

---

## 8. Open vragen

1. Bevestigen we: na Hiltje is **Gigi (di–do)** de afronder?  
2. Accepteren we begrensde vrijheid (standaard + klein setje; rest handmatig)?  
3. Mag het gast-pack blijven als intake, met print via generator?  
4. Checklist “goed genoeg om te printen”?  
5. Lied-zip: voldoende voor Gigi, of blijft muziek-in-Word een harde eis?  
6. Vaste predikanten via formulier (simpele happy path), of alleen B?

---

*Dit plan is bedoeld om woensdag te bespreken. Geen implementatie starten zonder akkoord op opvolging + vrijheidsgrens in §1b/§5.*
