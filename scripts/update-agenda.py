#!/usr/bin/env python3
"""Haal de agenda van www.vrijburg.nl op en schrijf agenda.json.

Waarom: sinds de overstap van WordPress naar een eigen (Hugo-)site bestaat
de WP REST API (/wp-json/wp/v2/evenementen) niet meer, en de nieuwe site
stuurt geen CORS-headers. De liturgie-app kan vrijburg.nl dus niet zelf
vanuit de browser uitlezen. Dit script draait in een GitHub Action
(.github/workflows/update-agenda.yml) en zet het resultaat als statisch
bestand naast index.html, zodat de app het van zijn eigen domein haalt.

Bronnen:
- /evenementen/            overzicht: titel, datum ("do 15 okt 2026"), link
- /evenementen/<slug>/     detail: Datum / Tijd / Locatie + beschrijving

De RSS-feed (/evenementen/index.xml) is onbruikbaar: alle pubDates staan
op 1-1-2000, de echte datum zit alleen in de HTML.

Gebruik:
    python3 scripts/update-agenda.py            # schrijft agenda.json
    python3 scripts/update-agenda.py --dagen 90 # verder vooruit kijken
Alleen standaardbibliotheek, geen pip-installaties nodig.
"""
import argparse
import datetime as dt
import html
import json
import re
import sys
import time
import urllib.request
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin
from zoneinfo import ZoneInfo

BASIS = 'https://www.vrijburg.nl'
OVERZICHT = BASIS + '/evenementen/'
TZ = ZoneInfo('Europe/Amsterdam')
UA = 'Vrijburg-liturgie-generator/1.0 (+https://liturgie.vrijburg.nl)'

MAANDEN = {
    'jan': 1, 'feb': 2, 'mrt': 3, 'maa': 3, 'apr': 4, 'mei': 5, 'jun': 6,
    'jul': 7, 'aug': 8, 'sep': 9, 'okt': 10, 'nov': 11, 'dec': 12,
}


def haal(url: str) -> str:
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    for poging in range(3):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.read().decode('utf-8', errors='replace')
        except Exception as e:  # noqa: BLE001
            if poging == 2:
                raise
            print(f'  opnieuw ({e}): {url}', file=sys.stderr)
            time.sleep(2 * (poging + 1))
    return ''


def parse_datum(tekst: str):
    """'do 15 okt 2026' / 'donderdag 15 oktober 2026' -> date of None."""
    m = re.search(r'(\d{1,2})\s+([a-zA-Z]{3})[a-zA-Z]*\.?\s+(\d{4})', tekst or '')
    if not m:
        return None
    maand = MAANDEN.get(m.group(2).lower())
    if not maand:
        return None
    try:
        return dt.date(int(m.group(3)), maand, int(m.group(1)))
    except ValueError:
        return None


def parse_tijd(tekst: str):
    """'14:00' / '14.00 uur' / '11.00 tot 13.00 uur' -> '14:00' (begintijd)."""
    m = re.search(r'\b(\d{1,2})[:.](\d{2})\b', tekst or '')
    if not m:
        return None
    u, mi = int(m.group(1)), int(m.group(2))
    if u > 23 or mi > 59:
        return None
    return f'{u:02d}:{mi:02d}'


class Knoop:
    """Minimale DOM-boom zodat we op class/tag kunnen zoeken."""
    __slots__ = ('tag', 'attrs', 'kinderen', 'ouder')

    def __init__(self, tag, attrs, ouder):
        self.tag = tag
        self.attrs = dict(attrs)
        self.kinderen = []  # Knoop of str
        self.ouder = ouder

    @property
    def classes(self):
        return set((self.attrs.get('class') or '').split())

    def alle(self, tag=None, cls=None):
        for k in self.kinderen:
            if isinstance(k, Knoop):
                if (tag is None or k.tag == tag) and (cls is None or cls in k.classes):
                    yield k
                yield from k.alle(tag, cls)

    def eerste(self, tag=None, cls=None):
        return next(self.alle(tag, cls), None)

    def kids(self, tag=None):
        return [k for k in self.kinderen if isinstance(k, Knoop) and (tag is None or k.tag == tag)]

    def tekst(self, blok=False):
        """Tekst; met blok=True worden <p>/<br>/<li> regelovergangen."""
        delen = []

        def loop(n):
            for k in n.kinderen:
                if isinstance(k, str):
                    delen.append(k)
                else:
                    if k.tag in ('script', 'style'):
                        continue
                    if blok and k.tag == 'br':
                        delen.append('\n')
                    loop(k)
                    if blok and k.tag in ('p', 'li', 'div', 'h1', 'h2', 'h3', 'h4'):
                        delen.append('\n')

        loop(self)
        t = ''.join(delen).replace(' ', ' ')
        if not blok:
            return re.sub(r'\s+', ' ', t).strip()
        regels = [re.sub(r'[ \t]+', ' ', r).strip() for r in t.split('\n')]
        uit, leeg = [], False
        for r in regels:
            if r:
                uit.append(r)
                leeg = False
            elif not leeg and uit:
                uit.append('')
                leeg = True
        return '\n'.join(uit).strip()


VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link',
        'meta', 'source', 'track', 'wbr'}


class Bouwer(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Knoop('#root', [], None)
        self.cur = self.root

    def handle_starttag(self, tag, attrs):
        k = Knoop(tag, attrs, self.cur)
        self.cur.kinderen.append(k)
        if tag not in VOID:
            self.cur = k

    def handle_startendtag(self, tag, attrs):
        self.cur.kinderen.append(Knoop(tag, attrs, self.cur))

    def handle_endtag(self, tag):
        n = self.cur
        while n is not None and n.tag != tag:
            n = n.ouder
        if n is not None and n.ouder is not None:
            self.cur = n.ouder

    def handle_data(self, data):
        self.cur.kinderen.append(data)


def dom(src: str) -> Knoop:
    b = Bouwer()
    b.feed(src)
    b.close()
    return b.root


def lees_overzicht(src: str):
    items = []
    for art in dom(src).alle('article'):
        if 'evenementen' not in art.classes:
            continue
        h = art.eerste('h2') or art.eerste('h3')
        a = h.eerste('a') if h else None
        if not a or not a.attrs.get('href'):
            continue
        datum_el = art.eerste(cls='date')
        summary = art.eerste(cls='entry-summary')
        samenvatting = (summary.eerste('p') or summary) if summary else None
        items.append({
            'titel': html.unescape(a.tekst()),
            'url': urljoin(OVERZICHT, a.attrs['href']),
            'datum': parse_datum(datum_el.tekst() if datum_el else ''),
            'samenvatting': samenvatting.tekst() if samenvatting else '',
        })
    return items


def lees_detail(src: str):
    root = dom(src)
    art = root.eerste('article') or root
    velden = {}
    header = art.eerste('header') or art
    for kol in header.alle('div'):
        sterk = kol.eerste('strong')
        if not sterk or kol.ouder is None or 'row' not in kol.ouder.classes:
            continue
        label = sterk.tekst().lower()
        waarde = kol.tekst()
        if waarde.lower().startswith(label):
            waarde = waarde[len(label):].strip()
        velden[label] = waarde
    inhoud = art.eerste(cls='entry-content')
    return {
        'datum': parse_datum(velden.get('datum', '')),
        'tijd': parse_tijd(velden.get('tijd', '')),
        'tijd_tekst': velden.get('tijd', ''),
        'locatie': velden.get('locatie', '').strip(),
        'tekst': inhoud.tekst(blok=True) if inhoud else '',
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--dagen', type=int, default=70,
                    help='hoeveel dagen vooruit details ophalen (standaard 70)')
    ap.add_argument('--uit', default=str(Path(__file__).resolve().parent.parent / 'agenda.json'))
    args = ap.parse_args()

    vandaag = dt.datetime.now(TZ).date()
    grens = vandaag + dt.timedelta(days=args.dagen)

    print(f'Overzicht ophalen: {OVERZICHT}')
    overzicht = lees_overzicht(haal(OVERZICHT))
    print(f'  {len(overzicht)} evenementen in overzicht')
    if not overzicht:
        sys.exit('Geen evenementen gevonden — is de HTML-structuur van vrijburg.nl veranderd? '
                 'agenda.json niet aangepast.')

    evenementen = []
    for it in overzicht:
        d = it['datum']
        if d is None or d < vandaag or d > grens:
            continue
        try:
            det = lees_detail(haal(it['url']))
        except Exception as e:  # noqa: BLE001
            print(f'  detail mislukt ({e}): {it["url"]}', file=sys.stderr)
            det = {'datum': None, 'tijd': None, 'tijd_tekst': '', 'locatie': '', 'tekst': ''}
        datum = det['datum'] or d
        tijd = det['tijd']
        # 00:00 is op de site de standaardwaarde voor "geen tijd ingevuld"
        if tijd == '00:00':
            tijd = None
        evenementen.append({
            'titel': it['titel'],
            'datum': datum.isoformat(),
            'tijd': tijd,
            'locatie': det['locatie'],
            'samenvatting': it['samenvatting'],
            'tekst': det['tekst'],
            'url': it['url'],
        })
        time.sleep(0.3)  # vriendelijk voor de server

    evenementen.sort(key=lambda e: (e['datum'], e['tijd'] or '99:99', e['titel']))
    print(f'  {len(evenementen)} evenementen tussen {vandaag} en {grens}')

    uit = Path(args.uit)
    oud = None
    if uit.exists():
        try:
            oud = json.loads(uit.read_text(encoding='utf-8')).get('evenementen')
        except Exception:  # noqa: BLE001
            oud = None
    if oud == evenementen:
        print('Geen inhoudelijke wijzigingen; agenda.json ongewijzigd.')
        return

    data = {
        'bron': OVERZICHT,
        'bijgewerkt': dt.datetime.now(TZ).isoformat(timespec='minutes'),
        'evenementen': evenementen,
    }
    uit.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Geschreven: {uit}')


if __name__ == '__main__':
    main()
