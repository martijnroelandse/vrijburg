#!/usr/bin/env python3
"""Kopieer de agenda van www.vrijburg.nl naar agenda.json.

Waarom: vrijburg.nl publiceert de agenda als JSON
(/evenementen/index.json: kerkdiensten + activiteiten), maar stuurt geen
CORS-header. De liturgie-app probeert die JSON eerst rechtstreeks; weigert de
browser dat, dan valt de app terug op deze kopie op het eigen domein. Dit
script draait dagelijks in .github/workflows/update-agenda.yml.

Zodra vrijburg.nl `Access-Control-Allow-Origin` meestuurt op
/evenementen/*.json, haalt de app de agenda altijd live op en is dit script
(met de workflow en agenda.json) niet meer nodig.

Gebruik:
    python3 scripts/update-agenda.py      # schrijft agenda.json
Alleen standaardbibliotheek, geen pip-installaties nodig.
"""
import argparse
import datetime as dt
import json
import sys
import time
import urllib.request
from pathlib import Path
from zoneinfo import ZoneInfo

BRON = 'https://www.vrijburg.nl/evenementen/index.json'
TZ = ZoneInfo('Europe/Amsterdam')
UA = 'Vrijburg-liturgie-generator/1.0 (+https://liturgie.vrijburg.nl)'


def haal(url: str):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    for poging in range(3):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.loads(r.read().decode('utf-8'))
        except Exception as e:  # noqa: BLE001
            if poging == 2:
                raise
            print(f'  opnieuw ({e}): {url}', file=sys.stderr)
            time.sleep(2 * (poging + 1))
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--uit', default=str(Path(__file__).resolve().parent.parent / 'agenda.json'))
    args = ap.parse_args()

    print(f'Ophalen: {BRON}')
    evenementen = haal(BRON)
    if not isinstance(evenementen, list) or not evenementen or 'title' not in evenementen[0]:
        sys.exit('Onverwacht formaat of lege agenda van vrijburg.nl — agenda.json niet aangepast.')
    print(f'  {len(evenementen)} evenementen')

    uit = Path(args.uit)
    try:
        oud = json.loads(uit.read_text(encoding='utf-8')).get('evenementen')
    except Exception:  # noqa: BLE001
        oud = None
    if oud == evenementen:
        print('Geen inhoudelijke wijzigingen; agenda.json ongewijzigd.')
        return

    data = {
        'bron': BRON,
        'bijgewerkt': dt.datetime.now(TZ).isoformat(timespec='minutes'),
        'evenementen': evenementen,
    }
    uit.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Geschreven: {uit}')


if __name__ == '__main__':
    main()
