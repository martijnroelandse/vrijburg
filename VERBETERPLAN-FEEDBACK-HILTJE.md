# Verbeterplan n.a.v. feedback Hiltje (juli 2026)

Dit document analyseert de feedback van Hiltje (die normaliter de liturgie
handmatig maakt) op de Liturgie Generator, koppelt elk punt aan de plek in
de code waar het probleem zit, en stelt concrete verbeteringen voor.
Bedoeld als gespreksstuk — Hiltje geeft zelf aan dat ze het er nog over wil
hebben voordat er iets gebouwd wordt, dus dit is een **voorstel**, geen
uitgevoerde implementatie.

## Kernprobleem (haar hoofdbezwaar)

> "Mijn voornaamste bezwaar is dat je (vooral) de voorganger die er gebruik
> van maakt, in een keurslijf dwingt. […] En het zijn vaak de uitzonderingen
> die de meeste tijd kosten."

De tool is gebouwd rond **één basisliturgie-stramien**. Dat stramien is voor
het overgrote deel *hardcoded* in de `.docx`-generatiecode
(`buildDocx()` in `index.html`, rond regel 2860-3010): vaste teksten
(Bemoediging, Groet, Onze Vader, Uitzending, Zegen) worden in een vaste
volgorde neergezet, met maar één plek die echt vrij is: de "Orde van
dienst"-lijst (lied/lezing/inleiding/muziek/overig).

Twee soorten problemen komen daaruit voort:

1. **Onzichtbaarheid / onduidelijke labels** — je ziet pas wat er automatisch
   bijkomt (of juist ontbreekt) als je het `.docx`-bestand downloadt.
2. **Structurele onbuigzaamheid** — bepaalde blokken (Gebed na de Groet,
   Voorbeden, Onze Vader, Uitzending/Zegen) zijn niet bewerkbaar,
   herschikbaar of uit te breiden, terwijl gastvoorgangers hier juist vaak
   van afwijken.

Beide moeten worden aangepakt: het eerste is met kleine, losse fixes te
verhelpen; het tweede vraagt om de vaste blokken op dezelfde flexibele
manier te behandelen als de "Orde van dienst"-lijst dat nu al doet.

---

## Punt 1 — "Beschrijving liturgie" vs. Thema, en voor wie zijn de Mailchimp-hints?

**Wat ze schrijft:** onduidelijk wat "Beschrijving liturgie" toevoegt naast
Thema, en voor wie de opmerkingen onder het Nieuwsbrief-veld (en het
Mailchimp-verhaal) bedoeld zijn.

**Waar in de code:**
- Thema/omschrijving: `index.html` regel 650-661 (`#thema`, `#intro`)
- Nieuwsbrief + Mailchimp-knoppen: regel 695-714 (`#nieuwsbrief`,
  `copyMailchimpCards()`, `openNieuwsbriefPage()`, de `comm-hint`-tekst)

**Diagnose:** deze sectie ("2. Thema, foto & communicatie") is in de UI als
**primaire sectie voor de voorganger** ingesteld, maar bevat ook
functionaliteit die puur voor het bureau is (Mailchimp-cards,
nieuwsbrief-app). Er is geen visueel onderscheid tussen "dit vul je in
als voorganger" en "dit is bureau-gereedschap dat toevallig in dezelfde
sectie staat."

**Voorstel:**
- Label `Beschrijving liturgie` hernoemen naar iets als **"Introductietekst
  voorkant"** met duidelijker hulptekst, bijv. *"Korte tekst die onder het
  thema op de voorkant komt — een sfeerzin of korte aankondiging, geen
  samenvatting van de preek."*
- De Mailchimp-/nieuwsbrief-knoppen en hun toelichting visueel en
  functioneel afscheiden: een apart "Voor het bureau"-kader (bijv.
  ingeklapt/grijs, met label), zodat een gastvoorganger in één oogopslag
  ziet dat dit niet voor hen is.
- Overwegen om deze bureau-only knoppen alleen te tonen wanneer de rol
  `medewerker`/`compleet` is geselecteerd (het `data-owner`-mechanisme
  bestaat al voor andere velden, regel 1081-1090, maar wordt hier niet
  gebruikt).

**Impact/risico:** laag — puur tekst/UI, geen wijziging aan de
`.docx`-structuur.

---

## Punt 2 — Opening van de dienst: Votum/Groet onzichtbaar, geen plek voor het gebed

**Wat ze schrijft:** onduidelijk dat de vaste Votum en Groet hieronder
vallen; moet de voorganger hier bidden — dat is niet zichtbaar; als hij/zij
een eigen gebedstekst in de liturgie wil, waar kan die dan komen?

**Waar in de code:**
- Formulier "3. Opening van de dienst": regel 718-736 — bevat alleen
  `orgelspel_opening` en `lichtlied`. Er is geen enkel veld voor het gebed.
- Generatie: regel 2914-2925 — Bemoediging en Groet worden met vaste tekst
  (`BEMOEDIGING_LINES`, `GROET_LINES`) neergezet, gevolgd door een
  hardcoded losse regel:

  ```2925:2925:index.html
  children.push(p('Gebed', { bold: true }));
  ```

  Dit is **letterlijk het woord "Gebed"** — er is nergens een invoerveld
  waarmee de voorganger eigen gebedstekst kan meegeven. Vandaar haar vraag.

**Voorstel:**
- Voeg in sectie 3 een tekstveld toe: **"Gebed na de Groet"** (optioneel,
  `voorganger`-veld), met hulptekst *"Laat leeg voor alleen het woord
  'Gebed'; vul een tekst in als u de gebedstekst wilt afdrukken."*
- Toon in het formulier zelf (niet pas in de download) een korte,
  niet-bewerkbare preview-regel van de vaste Bemoediging/Groet-tekst, zodat
  meteen duidelijk is dat die er al in zit en niet apart hoeft te worden
  aangeleverd. (Zie ook het bredere voorstel voor een live-voorbeeldpaneel
  onderaan.)

**Impact/risico:** laag/gemiddeld — één nieuw veld + kleine aanpassing in
`buildDocx()`.

---

## Punt 3 — Orde van dienst: overdenking, wat volgt erna, voorbeden, acclamaties, ander Onze Vader

Dit is het meest samengestelde punt en raakt de kern van het
"keurslijf"-bezwaar.

### 3a. "Valt de overweging hier onder?" — nee, pas na dit blok

**Waar:** De vrije lijst (`orde-list`, regel 1645-1727, typen
`lied/lezing/inleiding/muziek/overig`) eindigt, en dán volgt in
`buildDocx()` altijd een **hardcoded** blok:

```2931:2935:index.html
  // OVERDENKING
  children.push(empty());
  children.push(p('Overdenking', { bold: true, before: 120 }));
  children.push(p('Stilte', { bold: true }));
  children.push(p('Muziek', { bold: true }));
```

De voorganger kan dus geen lied/lezing/inleiding **na** de overdenking
plaatsen — dat past niet in de datastructuur.

### 3b. "Daarna volgt een vast blokje Voorbeden" — bleek pas na downloaden

**Waar:** direct daarna, ook hardcoded:

```2937:2941:index.html
  // VOORBEDEN
  children.push(empty());
  children.push(p('Voorbeden', { bold: true, before: 120 }));
  children.push(p('Stil gebed, afgesloten met Onze Vader:'));
  ONZE_VADER.forEach(regel => children.push(p(regel, { indent: 0.5 })));
```

Dit staat nergens in het formulier zelf — het is onzichtbaar totdat je het
gedownloade document bekijkt. Vandaar haar verrassing.

### 3c. Acclamatie tussen de voorbeden, of een ander "Onze Vader"

Er is geen enkel invoerveld voor de inhoud van de Voorbeden, laat staan voor
tussenliggende acclamaties, en `ONZE_VADER` is een vaste JS-constante
(regel ~909) zonder override-mogelijkheid.

**Voorstel (gefaseerd, van klein naar groot):**

1. ✅ *Geïmplementeerd:* een zichtbare sectie "Voorbeden" is toegevoegd aan
   het formulier (tussen Orde van dienst en Afsluiting), met:
   - een vrij tekstveld `voorbeden_tekst` — leeg = standaardtekst "Stil
     gebed, afgesloten met Onze Vader:"; ingevuld = die tekst (kan zelf
     acclamaties bevatten, in de volgorde die de voorganger wil);
   - een checkbox `geen_onze_vader` — indien aangevinkt wordt de vaste
     `ONZE_VADER`-tekst niet meer toegevoegd (voor wie zelf een afsluiting
     in het tekstveld hierboven heeft opgenomen).
   - Dit is bewust de lichte variant (vrij tekstveld i.p.v. een
     item-per-acclamatie-lijst) — snel te bouwen, dekt de praktijksituatie
     die Hiltje beschrijft, en breekt niets voor wie niets aanpast.
2. **Structurele oplossing (grotere ingreep, aparte discussie met Hiltje):**
   maak "Overdenking" en "Voorbeden" **item-typen in dezelfde vrije lijst**
   als lied/lezing/muziek, in plaats van hardcoded stappen na de lijst. Zo
   kan een voorganger zelf bepalen: eerst overdenking, dan een lied, dan pas
   voorbeden — of welke volgorde dan ook. Sensible default: als niemand iets
   aanpast, wordt de lijst automatisch aangevuld met "Overdenking" en
   "Voorbeden" op de huidige plek, zodat de standaardgebruiker niets hoeft
   te doen.

**Impact/risico:** stap 1 is gemiddeld (nieuwe velden + generatielogica,
geen datamodel-wijziging). Stap 2 is groot (wijzigt het datamodel van
`ordeItems` en de render-volgorde fundamenteel) — pas oppakken na overleg
met Hiltje, zoals zij zelf voorstelt.

---

## Punt 4 — Afsluiting: sommige voorgangers willen Uitzending → lied → Zegen → lied

**Waar in de code:**
- Formulier "5. Afsluiting": regel 757-772 — alleen `slotlied` en
  `orgelspel_slot`.
- Generatie, hardcoded volgorde én **Uitzending en Zegen als één regel**:

```2972:2978:index.html
  children.push(p('De gemeente gaat staan', { italic: true, before: 120 }));
  children.push(p(slotlied ? 'Slotlied ' + slotlied : 'Slotlied', { bold: true }));
  children.push(p('Uitzending en zegen', { bold: true }));
  if (orgelSlot) children.push(pOrgelspel('Orgelspel: ' + orgelSlot));
  else            children.push(p('Orgelspel', { bold: true }));
```

Er is geen manier om Uitzending en Zegen te scheiden, laat staan om er
liedcoupletten tussen te zetten.

**Voorstel:**
- Splits "Uitzending en zegen" in twee losse regels/items (`Uitzending`,
  `Zegen`), dat is op zichzelf al winst.
- Maak de Afsluiting-sectie — net als bij Voorbeden — een kleine vrije lijst
  met item-typen `lied(fragment)`, `uitzending`, `zegen`, `orgelspel`, met
  als standaardvolgorde exact het huidige gedrag, maar met de mogelijkheid
  voor de voorganger om te herschikken of tussenvoegen.

**Impact/risico:** gemiddeld — vergelijkbaar met de Voorbeden-lijst in punt
3, kan met dezelfde UI-component (herbruik van de bestaande
`orde-item`-component) worden gebouwd.

---

## Punt 5 — Collecte met bijzondere bestemming (bijv. augustus: Cuba i.p.v. diaconie) + eigen QR-code

**Waar in de code:**
- Formulier: het type-veld van de tweede collecte kent maar twee opties:

```818:821:index.html
  <select id="c2_type" onchange="onC2TypeChange()">
    <option value="diaconie">Diaconie</option>
    <option value="gemeente">Gemeente</option>
  </select>
```

- Generatie: de QR-afbeelding en de link naar `vrijburg.nl/collecte...` zijn
  hardcoded gekoppeld aan exact deze twee typen:

```2741:2744:index.html
  async function buildQrBlock(qrType) {
    const rightPath = qrType === 'diaconie' ? DOCX_ASSETS.qrDiaconie : DOCX_ASSETS.qrGemeente;
    const rightLabel = `vrijburg.nl/collecte${qrType}`;
    const rightUrl = `https://www.vrijburg.nl/collecte${qrType}`;
```

Een collecte voor "Cuba" (of een ander eenmalig doel) past dus niet: er is
geen derde optie en geen manier om een andere QR-afbeelding/URL te koppelen.

**Voorstel:** ✅ *Geïmplementeerd (lichte variant)*
- Een derde optie **"Bijzondere collecte"** is toegevoegd aan het type-veld,
  met een eigen naamveld (`c2_naam`, bijv. "Wederopbouw Cuba") in plaats
  van de vaste tekst "onze diaconie"/"onze gemeente".
- Deze optie gebruikt een vierde, vaste QR-afbeelding
  (`DOCX_ASSETS.qrBijzonder` → `assets/collecte_bijzonder.png`) en de link
  `vrijburg.nl/bijzonderecollecte` — de bestaande, echte pagina op
  vrijburg.nl voor dit doel (aangeleverd door Martijn). Let op: dit volgt
  een ander URL-patroon dan diaconie/gemeente (`bijzonderecollecte` i.p.v.
  `collectebijzonder`), dat is expliciet in de code afgehandeld.
- Val terug op het huidige gedrag (diaconie/gemeente + standaard-QR) als er
  niets aangepast is — geen impact op de bestaande, veelvoorkomende flow.
- *Niet geïmplementeerd (bewust, lagere prioriteit):* een upload-mogelijkheid
  voor een eigen QR-afbeelding per dienst. Dat is alleen nodig als de
  bijzondere collecte per keer een andere QR-code/URL nodig heeft in plaats
  van één vaste "bijzondere collecte"-pagina op vrijburg.nl.

**Impact/risico:** laag zoals geïmplementeerd (geen nieuwe upload/opslag-flow
nodig, alleen een extra dropdown-optie + veld).

---

## Overkoepelend voorstel: zichtbaarheid vóór flexibiliteit

Veel van bovenstaande klachten ("dat bleek pas na het downloaden", "waar
kan dat dan?") zijn net zo goed een **zichtbaarheidsprobleem** als een
flexibiliteitsprobleem. Twee maatregelen die in combinatie het grootste deel
van de klachten wegnemen, ook nog vóórdat de grotere structurele
aanpassingen (punt 3b/4) zijn gebouwd:

1. **Live-voorbeeldpaneel.** Een paneel (of knop "Voorbeeld") dat de
   volledige, opgemaakte liturgietekst laat zien zoals die eruit komt te
   zien — inclusief alle vaste, niet-bewerkbare onderdelen (Bemoediging,
   Groet, Voorbeden, Onze Vader, Uitzending, Zegen) — dat live meebeweegt
   terwijl je typt. Dit lost in één keer de onzichtbaarheids-klacht bij
   punt 2, 3b en 4 op, zonder dat er iets aan de datastructuur hoeft te
   veranderen.
2. **Korte contextuele uitleg per sectie.** Een klein, uitklapbaar
   "Wat gebeurt hier automatisch?"-blokje per sectie (Opening, Orde van
   dienst, Afsluiting) dat in gewone taal uitlegt welke vaste tekst
   automatisch wordt toegevoegd en waar eventuele afwijkingen kunnen worden
   ingevuld. `info.html` (de huidige handleiding) noemt op dit moment geen
   van de vaste liturgie-onderdelen (Votum, Groet, Voorbeden, Onze Vader,
   Uitzending, Zegen) — dat zou hier ook in mee moeten.
3. **Eenvoudig vs. uitgebreid.** Op termijn een toggle "Volg ik de
   standaardliturgie?" — bij "ja" blijft het formulier zoals nu (kort en
   simpel voor de meerderheid); bij "nee" verschijnen de extra
   velden/lijsten uit punt 2-4 voor wie wil afwijken. Zo wordt het
   formulier niet nodeloos overweldigend voor gastvoorgangers die wél de
   standaardvolgorde volgen, wat haar zorg was over de gebruiksvriendelijkheid.

---

## Voorgestelde volgorde van uitvoering

**Fase 1 — Quick wins (lage impact, geen wijziging aan het datamodel)**
- [ ] Labels verduidelijken: "Beschrijving liturgie" → "Introductietekst
      voorkant" (punt 1)
- [ ] Mailchimp/nieuwsbrief-knoppen visueel scheiden als "voor het bureau"
      (punt 1)
- [ ] Uitzending en Zegen als twee losse regels in plaats van één (punt 4,
      eerste helft)
- [ ] `info.html` uitbreiden met uitleg over de vaste onderdelen (Votum,
      Groet, Gebed, Voorbeden, Onze Vader, Uitzending, Zegen)

**Fase 2 — Nieuwe velden zonder herontwerp van het datamodel**
- [ ] Tekstveld "Gebed na de Groet" in sectie Opening (punt 2)
- [x] Sectie "Voorbeden" met override voor Onze Vader + vrij tekstveld voor
      acclamaties (punt 3a/3c, lichte variant)
- [x] Collecte: optie "Bijzondere collecte" met eigen naam + vierde QR-code
      (punt 5, lichte variant — geen per-dienst QR-upload)
- [ ] Live-voorbeeldpaneel met de volledige liturgietekst (overkoepelend
      voorstel 1)

**Fase 3 — Structurele wijzigingen (groter, eerst bespreken met Hiltje)**
- [ ] Overdenking en Voorbeden omzetten naar item-typen in een vrije lijst,
      zodat volgorde en tussenvoegen (lied, acclamatie) vrij is (punt 3a/3b)
- [ ] Afsluiting omzetten naar een vrije lijst (punt 4, volledige variant)
- [ ] Eenvoudig/uitgebreid-toggle (overkoepelend voorstel 3)

## Aanbevolen vervolgstap

Dit plan met Hiltje doornemen — met name Fase 3 raakt de kern van hoe zij
en gastvoorgangers de liturgie ervaren, en zij heeft zelf al aangegeven dat
ze hierover wil doorpraten. Fase 1 en (grotendeels) Fase 2 zijn low-risk en
kunnen ook zonder verder overleg gebouwd worden, omdat ze het bestaande
gedrag voor de standaardgebruiker niet veranderen — ze voegen alleen
zichtbaarheid en optionele velden toe.
