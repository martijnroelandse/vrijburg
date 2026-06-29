#!/usr/bin/env python3
"""Converteer dienstplanning CSV (Google Sheets export) naar dienstplanning.json."""

import csv
import json
import re
import sys
from datetime import datetime
from pathlib import Path

CSV_URL = (
    "https://docs.google.com/spreadsheets/d/"
    "1imjMr9ELUHGV9331mYIoTOUc-DizOysV/export?format=csv"
)

LOC_CODES = {
    "th": "Thomaskerk",
    "zw": "Willem de Zwijger",
    "or": "Oranjekerk",
}


def clean(v):
    v = (v or "").strip()
    return v if v and v not in ("?",) else ""


def flag(v):
    v = (v or "").strip().lower()
    return bool(v and v not in ("?",))


def get_col(row, *names):
    for name in names:
        if name in row:
            v = clean(row[name])
            if v:
                return v
    return ""


def parse_aanvangstijd(raw):
    v = clean(raw)
    if not v:
        return "", []
    low = v.lower()
    if low in LOC_CODES:
        return "", [f"Locatie: {LOC_CODES[low]}"]
    if re.match(r"^\d{1,2}[:.]\d{2}$", v):
        return v.replace(".", ":"), []
    return v, []


def convert(csv_path: Path) -> list:
    rows = []
    with csv_path.open(encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            datum_raw = r.get("Datum", "").strip()
            if not datum_raw:
                continue
            d = datetime.strptime(datum_raw, "%d-%m-%Y")

            kk = get_col(r, "KK", "Kinderkerk")
            if kk.lower() == "kk":
                kk = "ja"

            aanvangstijd, extra = parse_aanvangstijd(r.get("Afwijkende aanvangstijd"))

            bijz = list(extra)
            for label, keys in [
                ("Vrijburg laat voorgaan", ("VLV", "V.L.Voorgaan")),
                ("Vrijburg laat horen", ("VLH", "V.L.Horen ♫♫ ")),
                ("Vrijburg laat zien", ("VLZ", "V.L.Zien")),
                ("Avondmaal", ("Avondmaal",)),
            ]:
                v = get_col(r, *keys)
                if v:
                    bijz.append(f"{label}: {v}" if label != "Avondmaal" else f"Avondmaal: {v}")

            opm = get_col(r, "Opmerkingen")
            if opm:
                bijz.append(opm)

            rows.append({
                "datum": d.strftime("%Y-%m-%d"),
                "aanvangstijd": aanvangstijd,
                "bijzondere_dienst": get_col(r, "Feestdag"),
                "predikant": get_col(r, "Predikant"),
                "organist": get_col(r, "Organist"),
                "cantorij": flag(get_col(r, "Cantorij ♫♫ ")),
                "kinderkerk": kk,
                "lector": get_col(r, "Lector"),
                "bijzonderheden": "\n".join(bijz),
            })
    return rows


def main():
    root = Path(__file__).resolve().parents[1]
    out = root / "dienstplanning.json"
    csv_path = Path(sys.argv[1]) if len(sys.argv) > 1 else root / "dienstplanning.csv"

    if not csv_path.exists():
        print(f"Gebruik: curl -sL '{CSV_URL}' -o dienstplanning.csv")
        print("        python3 scripts/update-dienstplanning.py dienstplanning.csv")
        print("   of:  python3 scripts/update-dienstplanning.py dienstplanning-2026.csv")
        sys.exit(1)

    rows = convert(csv_path)
    out.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"✓ {len(rows)} diensten geschreven naar {out}")


if __name__ == "__main__":
    main()
