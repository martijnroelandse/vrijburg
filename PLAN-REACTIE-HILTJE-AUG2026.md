# Plan: reactie op feedback Hiltje (augustus 2026)

**Status:** gespreksstuk — nog niets hiervan uitvoeren tot na overleg (liturgiecie woensdag).  
**Bron:** e-mail Hiltje over de liturgiegenerator (“weinig tijdbesparing voor wie de liturgie uiteindelijk samenstelt”).  
**Eerdere lijn:** `VERBETERPLAN-FEEDBACK-HILTJE.md` (juli 2026) — dit document **vervangt die niet**, maar legt een laag *daarboven*: de vraag of de tool de juiste taak oplost.

---

## 1. Wat Hiltje eigenlijk zegt (kern)

Niet: “fixje X is onduidelijk.”  
Wel: **de generator lost het zware werk van B (Hiltje) nauwelijks op**, en dwingt de gastpredikant wél in een digitaal keurslijf. De winst die er is (dienstplanning, collectes, link versturen) weegt voor haar niet op tegen:

1. het resterende handwerk na binnenkomst van predikant/organist (liederen, agenda, **opmaak tot veelvoud van 4 pagina’s**, printen);
2. de leercurve / vragen van gastpredikanten;
3. minder vrijheid dan nu met de basisliturgie-`.docx`.

Rachelles poging (10 augustus) versterkt dat: output was niet bruikbaar genoeg → Hiltje nam de inhoud over en werkte die uit in de basisliturgie.

**Conclusie om eerst te toetsen:** is dit een tooling-probleem (meer features) of een **product-positionering**-probleem (wie is de primaire gebruiker, en wat mag de tool *niet* proberen te vervangen)?

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

| Optie | Idee | Past bij haar feedback? |
|---|---|---|
| **A1 — Tool voor B, niet voor gastpredikant** | Predikant blijft basisliturgie/e-mail aanleveren; B plakt/importeert in de generator (lied-zip, agenda, collectes) en downloadt `.docx` | Sterk: minder keurslijf voor gasten; winst waar B tijd steekt |
| **A2 — Hybride** | Eigen predikanten → generator; gastpredikanten → oude pack (brief+basisliturgie+declaratie), B verwerkt | Realistisch t.o.v. wat zij beschrijft |
| **A3 — Generator als enige pad** | Iedereen via formulier; brief/basisliturgie uitfaseren | Zwak t.o.v. haar oordeel, tenzij UX + flexibiliteit drastisch verbeteren |
| **A4 — Pauzeren / smal houden** | Alleen onderhoud + bewezen winst (planning, collectes, lied-zip); geen nieuwe predikant-features tot liturgiecie beslist | Eerlijk als A3 niet haalbaar lijkt |

**Aanbeveling om woensdag voor te leggen:** mikken op **A2 (hybride)**, met duidelijke scope:  
*de generator is een hulpmiddel voor B (en eventueel vaste predikanten), geen verplichte vervanging van het gastpredikant-pakket.*

### B. Concrete bouwrichtingen — alleen zinvol *na* keuze A

Gesorteerd op “past op haar echte pijn” vs. “detail dat ze bewust parkeert”.

#### B1 — Hoge relevantie voor B’s resterende werk

1. **Liedlijst-zip → tekst + muziek 1e couplet in `.docx`**  
   Status: recent gebouwd. Past precies op “invullen liederen uit digitaal liedboek”.  
   Nog te toetsen met Hiltje: is de opmaak (afbeeldingsgrootte, volgorde t.o.v. tekst) bruikbaar genoeg, of wil zij zelf JPG-formaat blijven sturen in Word?

2. **Pagina-opmaak / “veelvoud van 4”**  
   Dit is haar echte knelpunt. Opties (van licht naar zwaar):  
   - live **paginaschatting** (“nu ~X blz.”) + tips (agenda inkorten/verlengen);  
   - agenda-sectie met **vulregels / witruimte**;  
   - echte WYSIWYG-layout in Word-kwaliteit (groot; waarschijnlijk **niet** in browser-docx te evenaren).  
   **Eerlijk advies:** volledige layout-controle zoals in haar Word-basisliturgie gaan we met `docx.js` niet evenaren. Beloven dat niet.

3. **Startmail gastpredikant met bijlagen**  
   Generator kan géén echte bijlagen in `mailto:` zetten. Wel:  
   - knop “Stel gastpredikant-mail samen” die subject/body + **checklist** toont;  
   - links/downloads naar de drie standaardbestanden (brief-template, basisliturgie, declaratie) in de repo/site;  
   - optioneel later: Edge Function + Resend die wél bijlagen stuurt (zoals `meld-klaar`).  
   Past op haar kritiek dat de huidige “link naar voorganger” haar mail **niet** vervangt.

4. **Modus “eigen predikant” vs “gast”**  
   Verbergt declaratie/brief-stappen; past bij haar onderscheid in aanloop.

#### B2 — Relevant, maar secundair (keurslijf / leerbaarheid)

Uit juli-plan, nog steeds geldig als we A3 of “vaste predikanten via formulier” willen:

- live-voorbeeldpaneel (zichtbaarheid vóór download);
- Overdenking/Afsluiting als vrije lijst (fase 3 juli-plan);
- eenvoudig/uitgebreid-toggle.

Alleen zinvol als we predikanten **bewust** in de tool houden.

#### B3 — Bewust parkeren (zij zet detail-kritiek opzij)

Lettertypen, regelafstand, logo-grootte, standaard-mailteksten, onduidelijke knopjes, “nutteloze” Liedboek-deeplinks — **niet** de woensdag-agenda, tenzij als snelle polish-lijst *nadat* de positionering helder is.

#### B4 — Waarschijnlijk niet / later

- Generator die haar handmatige Word-opmaak volledig vervangt.  
- Gastpredikant dwingen via formulier zonder basisliturgie-escape.  
- Agenda die automatisch “mooi op 4 pagina’s” past zonder menselijke layout-keuzes.

---

## 4. Antwoorden op haar feitelijke vragen (kort)

**“Waar komen de QR-codes vandaan?”**  
Vaste PNG’s in de repo (`assets/collecte1.png`, `collecte_diaconie.png`, `collecte_gemeente.png`, `collecte_bijzonder.png`), gekoppeld aan vrijburg.nl-collectepagina’s — niet live gegenereerd.

**“Vervangt de link-mail mijn mail met bijlagen?”**  
Nee. Die knop deelt alleen de cloud-link. Brief, basisliturgie en declaratie zitten daar niet in.

**“Blijft het werk van B na download bestaan?”**  
Ja — liederen (deels geholpen door zip-import), agenda/opmaak, printen. Dat is precies haar punt.

**“Rachelles download van 10 augustus”**  
Bevestigt: als de output nog kinderziektes heeft, valt B terug op basisliturgie. Criteria voor “goed genoeg” moeten door Hiltje worden gezet (niet door de bouwer alleen).

---

## 5. Voorstel voor de liturgiecie (woensdag)

### Doel van het gesprek

Niet feature-lijstjes afvinken, maar één besluit:

> **Voor wie is de generator primair, en wat blijft expres buiten de tool?**

### Voorgestelde stellingen om te toetsen

1. Gastpredikanten blijven (voorlopig) het **pack brief + basisliturgie + declaratie** krijgen.  
2. De generator is vooral voor **B** (en eventueel vaste predikanten/organisten): planning, collectes, lied-zip, agenda-inhoud, export.  
3. We beloven **geen** volledige vervanging van Hiltjes pagina-opmaak in Word.  
4. Eventuele predikant-UI alleen verbeteren als we A2/A3 kiezen én Hiltje een “goed genoeg”-proef accepteert (één echte dienst end-to-end).

### Doorsturen naar predikanten?

Haar aanbod: mail doorsturen naar predikanten/belanghebbenden.  
**Advies:** eerst liturgiecie; daarna eventueel een **korte samenvatting** (niet de hele kritische mail) + de gekozen positionering. Anders belandt de discussie in “de tool is nog niet af” i.p.v. “dit is de bedoelde rol.”

---

## 6. Als we wél gaan bouwen — voorgestelde volgorde

Alleen starten na akkoord op §5.

| Fase | Wat | Waarom |
|---|---|---|
| **0** | Positionering vastleggen in README/`info.html` (“voor wie / niet voor wie”) | Verwachtingen gelijk trekken |
| **1** | Gastpredikant-startpakket in de UI (templates downloaden + mailtekst-hulp; later optioneel mail met bijlagen) | Dicht het gat dat zij expliciet noemt |
| **2** | Lied-zip-import met Hiltje nalopen op echte dienst (opmaak muziek/tekst) | Raakt haar dinsdag-werk |
| **3** | Lichte pagina-hulp (schatting / agenda-witruimte) — géén full layout engine | Eerlijke hulp zonder valse belofte |
| **4** | Alleen indien predikanten in-tool blijven: juli-plan fase 1–2 (zichtbaarheid, gebed, voorbeeldpaneel); fase 3 na aparte OK | Keurslijf alleen aanpakken als die gebruiker blijft |

---

## 7. Bewuste non-goals (nu)

- Generator verplichten voor alle gastpredikanten.  
- Pixel-perfecte kopie van haar Word-basisliturgie.  
- Automatisch “altijd N×4 pagina’s”.  
- Grote UI-polish-ronde vóór strategisch besluit.

---

## 8. Open vragen aan Hiltje / liturgiecie

1. Mag de basisliturgie-mail voor gasten **blijven**, naast de generator?  
2. Zou B de generator wél willen gebruiken als predikant gewoon Word/e-mail blijft aanleveren (A1/A2)?  
3. Wanneer is een gegenereerde `.docx` “goed genoeg” om níet meer over te tikken in de basisliturgie? (checklist)  
4. Is lied-zip-import de goede plek om tijd te winnen, of blijft zij muziek liever handmatig in Word zetten?  
5. Willen vaste predikanten (Rachelle e.a.) überhaupt via het formulier werken, of was 10 augustus een eenmalige proef?

---

*Dit plan is bedoeld om woensdag te bespreken. Geen implementatie starten zonder akkoord op de positionering in §5.*
