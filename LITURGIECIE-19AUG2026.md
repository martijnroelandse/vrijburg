# Liturgiecommissie woensdag 19 augustus 2026

Gespreksstuk: open vragen + de collectelijst die de Liturgie Generator gebruikt (`collectes.json`, bron: *Collectes 2026–2027 teksten voor de liturgie*).

**Doel:** hoe maken we wekelijks een printbare liturgie als Hiltje stopt, met Gigi Calkoen (bureau, di–do) als afronder.

**Update 26 augustus 2026:** de omkering gemeente/diaconie in de generator is verwijderd. `type` in `collectes.json` is weer letterlijk de 2e collecte. Colombia/Cuba als bijzondere collecte volgt op het rooster van Gon/Gloria (nog niet ingeladen).

---

## 1. Besluiten (eerst dit)

1. **Afronding** — Na Hiltje rondt Gigi (di–do) af en print. Klopt dat? Wat mag zij *niet* hoeven kunnen?
2. **Vrijheid** — Generator = standaarddienst. Beperkt afwijken mag (gebed, voorbeden, bijzondere collecte). Doop, avondmaal, heel andere orde: Word-basisliturgie. Akkoord?
3. **“Goed genoeg om te printen”** — Wanneer is generator-output klaar voor de printer, zonder overzetten in de basisliturgie? (Rachelle 10 augustus ging nog over in Word.)
4. **Wie vult in?** — Vaste predikantes via de generator? Gasten via brief + basisliturgie, bureau zet het daarna in de tool? Of iedereen hetzelfde pad?

---

## 2. Praktisch (Hiltjes laatste ronde)

5. **Proefkonijn** — Rienk Lanooij, 30 augustus (gast), of de eigen predikantes op 6 september? Of allebei?
6. **Liederen: wie bepaalt?** — Organist ziet in de generator nu alleen muziek na de overdenking + orgelspel. Liederen zijn van de voorgang(st)er. Bevestigen met de organisten?
7. **Lied splijten** (bijv. couplet ná Bemoediging/Groet) — Voorlopig handwerk, of later in de tool?
8. **Agenda** — Import vult al vaste teksten + contact. Lijn: kort (komende week + wat opgave vraagt), of hele website-agenda? E-mails in de liturgie, niet op de site?
9. **Collectes** — Zie de lijst hieronder. Punten:
   - 16 augustus: Hiltje 2e = Cuba (anders Diaconie). Bestand zegt 2e = Diaconie, Mikondo; de generator zette 2e op **Gemeente** (omkering gemeente/diaconie). Klopt de kolom in het bestand, of moet de generator `type` letterlijk als 2e collecte gebruiken?
   - Bijzondere collecte (Cuba e.d.): B per dienst aanpassen, of in de lijst zetten?
   - Dubbele regel 2 april; geen 1 november; enkele regels zonder rekeningnummer.
10. **Voorblad-huisstijl** — Handmatig: liggend woordmerk. Generator: vierkant blauw vlak. Welke is officieel?
11. **Print** — Werken naar een veelvoud van 4 pagina’s: hulp in de tool, of Gigi’s laatste check?

---

## 3. Daarna, niet blokkerend

- Welke knoppen houdt Gigi over?
- Liedlijst-zip: muziek 1e couplet in Word genoeg?
- Gast-pack als aanlevering, print altijd via generator?
- Korte boodschap naar predikanten ná deze vergadering?

**Niet meer open:** inclusieve rol-namen; Mail me de link; mail vaste voorganger in jij-vorm; “Afbeelding op voorblad”; collecte-standaardtekst en footer 16pt; koffie/thee cursief; organist-scherm versmald.

**Voorstel voorzitter:** 15 min op 1–4, 10 min op 5, rest indien tijd.

---

## 4. Collectelijst in de generator

Bron: `collectes.json` (55 regels). Bij het kiezen van een datum:

- **1e collecte** = `naam` + `tekst` + `rekening` van die regel
- **2e collecte** zou volgens de bronkolom `type` Diaconie of Gemeente zijn
- **de code zet 2e nu op het omgekeerde** van `type` (gemeente ↔ diaconie)

Kolom **2e volgens lijst** = `type` in het bestand. Kolom **2e nu in de app** = wat er automatisch in het formulier komt.

| Datum | Thema | 1e collecte | 2e volgens lijst | 2e nu in de app |
|---|---|---|---|---|
| 3 januari | Zieken | Stichting Hospice het Veerhuis | Diaconie | Gemeente |
| 10 januari | Zieken | Stichting Vrienden van de Kruispost | Gemeente | Diaconie |
| 17 januari | Zieken | Stichting Opkikker | Diaconie | Gemeente |
| 24 januari | Zieken | Stichting INLIA | Gemeente | Diaconie |
| 31 januari | Zieken | Stichting Harriët Tubmanhuis | Diaconie | Gemeente |
| 7 februari | Gemeenten en anderen | Vereniging Vrijzinnige Protestanten | Gemeente | Diaconie |
| 14 februari | Gemeente en anderen | Remonstrantse Broederschap | Diaconie | Gemeente |
| 21 februari | Gemeenten en anderen | Stichting Leergeld Amsterdam en Omstreken | Gemeente | Diaconie |
| 28 februari | Gemeenten en anderen | Stichting Jarige Job | Diaconie | Gemeente |
| 1 maart | Jongeren en Armoede | Stichting Vrienden van Hope of Flowers (West Bank) | Diaconie | Gemeente |
| 8 maart | Jongeren en Armoede | Stichting Stiefkinderen van Moeder India (SCOMI) | Gemeente | Diaconie |
| 15 maart | Jongeren en Armoede | Stichting Leergeld Amsterdam en Omstreken | Diaconie | Gemeente |
| 22 maart | Jongeren en Armoede | Stichting Jarige Job | Gemeente | Diaconie |
| 29 maart | Jongeren en Armoede | Stichting Voedselbank Amsterdam | Diaconie | Gemeente |
| 2 april | Zieken | Witte donderdag | geen | Gemeente (fallback) |
| 2 april | Geen collecte | Geen collecte | geen | Gemeente (fallback) |
| 5 april | Zieken | Stichting Opkikker | Gemeente | Diaconie |
| 12 april | Zieken | Stichting Hospice het Veerhuis | Diaconie | Gemeente |
| 19 april | Zieken | Stichting Vrienden van de Kruispost | Gemeente | Diaconie |
| 26 april | Zieken | Stichting Hospice het Veerhuis | Diaconie | Gemeente |
| 3 mei | Dak- en thuislozen | Stichting Drugspastoraat Amsterdam | Gemeente | Diaconie |
| 10 mei | Dak- en thuislozen | Stichting Exodus | Diaconie | Gemeente |
| 17 mei | Dak- en Thuislozen | Makom | Gemeente | Diaconie |
| 24 mei | Dak- en Thuislozen | Stichting Stoelenproject | Diaconie | Gemeente |
| 31 mei | Dak- en Thuislozen | Stichting Harriët Tubmanhuis | Gemeente | Diaconie |
| 7 juni | Vluchtelingen | Stichting U.A.F. | Diaconie | Gemeente |
| 14 juni | Vluchtelingen | Stichting NAOMI | Gemeente | Diaconie |
| 21 juni | Vluchtelingen | Stichting Vluchteling | Diaconie | Gemeente |
| 28 juni | Vluchtelingen | Stichting INLIA | Gemeente | Diaconie |
| 5 juli | Zieken | Stichting Vrienden van de Kruispost | Diaconie | Gemeente |
| 12 juli | Zieken | Stichting Opkikker | Gemeente | Diaconie |
| 19 juli | Zieken | Stichting Drugspastoraat | Diaconie | Gemeente |
| 26 juli | Zieken | Stichting Hospice het Veerhuis | Gemeente | Diaconie |
| 2 augustus | Buitenland | Stichting Stiefkinderen van Moeder India (SCOMI) | Diaconie | Gemeente |
| 9 augustus | Buitenland | Stichting Vrienden van Hope Flowers (West Bank) | Gemeente | Diaconie |
| **16 augustus** | Buitenland | Stichting Vrienden van Mikondo | **Diaconie** | **Gemeente** |
| 23 augustus | Buitenland | Stichting Stiefkinderen van Moeder India (SCOMI) | Gemeente | Diaconie |
| 30 augustus | Buitenland | Stichting Vrienden van Hope Flowers (West Bank) | Diaconie | Gemeente |
| 6 september | Jongeren en Armoede | Stichting Leergeld Amsterdam en Omstreken | Gemeente | Diaconie |
| 13 september | Jongeren en Armoede | Stichting Jarige Job | Diaconie | Gemeente |
| 20 september | Jongeren en Armoede | PAX | Gemeente | Diaconie |
| 27 september | Jongeren en Armoede | Stichting Voedselbank | Diaconie | Gemeente |
| 4 oktober | Dak- en Thuislozen | Stichting Stoelenproject | Gemeente | Diaconie |
| 11 oktober | Dak- en Thuislozen | Makom | Diaconie | Gemeente |
| 18 oktober | Dak- en Thuislozen | Stichting Harriët Tubmanhuis | Gemeente | Diaconie |
| 25 oktober | Dak- en Thuislozen | Stichting Exodus | Diaconie | Gemeente |
| 8 november | Vluchtelingen | Stichting NAOMI | Diaconie | Gemeente |
| 15 november | Vluchtelingen | Stichting INLIA | Gemeente | Diaconie |
| 22 november | Vluchtelingen | Stichting UAF | Diaconie | Gemeente |
| 29 november | Vluchtelingen | Stichting Orange the World | Gemeente | Diaconie |
| 6 december | Dak- en Thuislozen | Stichting Drugspastoraat | Diaconie | Gemeente |
| 13 december | Dak- en Thuislozen | Makom | Gemeente | Diaconie |
| 20 december | Dak- en Thuislozen | Stichting Exodus | Diaconie | Gemeente |
| 24 december | Dak- en Thuislozen | Stichting Stoelenproject Amsterdam | Gemeente | Diaconie |
| 25 december | Dak- en Thuislozen | Stichting Stoelenproject Amsterdam | Diaconie | Gemeente |

Ontbreekt: **1 november**. Dubbel: **2 april**. Geen rekeningnummer in het bestand o.a. bij Harriët Tubmanhuis (31 jan / 31 mei / 18 okt), Exodus (10 mei / 25 okt / 20 dec), NAOMI (14 jun / 8 nov), Mikondo (16 aug), Orange the World (29 nov). Cuba staat niet in deze lijst.
