#!/usr/bin/env python3
"""Converteer dienstplanning CSV (Google Sheets export) naar dienstplanning.json."""

import csv
import json
import sys
from datetime import datetime
from pathlib import Path

CSV_URL = (
    "https://docs.google.com/spreadsheets/d/"
    "1imjMr9ELUHGV9331mYIoTOUc-DizOysV/export?format=csv"
)


def clean(v):
    v = (v or "").strip()
    return v if v and v not in ("?",) else ""


def flag(v):
    v = (v or "").strip().lower()
    return bool(v and v not in ("?",))


def convert(csv_path: Path) -> list:
    rows = []
    with csv_path.open(encoding="utf-8") as f:
        for r in csv.DictReader(f):
            datum_raw = r.get("Datum", "").strip()
            if not datum_raw:
                continue
            d = datetime.strptime(datum_raw, "%d-%m-%Y")
            kk = clean(r.get("Kinderkerk"))
            if kk.lower() == "kk":
                kk = "ja"
            bijz = []
            for label, key in [
                ("Vrijburg laat horen", "V.L.Horen ♫♫ "),
                ("Vrijburg laat zien", "V.L.Zien"),
                ("Vrijburg laat voorgaan", "V.L.Voorgaan"),
                ("Avondmaal", "Avondmaal"),
            ]:
                v = clean(r.get(key))
                if v:
                    bijz.append(f"{label}: {v}" if label != "Avondmaal" else f"Avondmaal: {v}")
            rows.append({
                "datum": d.strftime("%Y-%m-%d"),
                "aanvangstijd": clean(r.get("Afwijkende aanvangstijd")),
                "bijzondere_dienst": clean(r.get("Feestdag")),
                "predikant": clean(r.get("Predikant")),
                "organist": clean(r.get("Organist")),
                "cantorij": flag(r.get("Cantorij ♫♫ ")),
                "kinderkerk": kk,
                "lector": clean(r.get("Lector")),
                "bijzonderheden": "\n".join(bijz),
            })
    return rows


def main():
    root = Path(__file__).resolve().parents[1]
    out = root / "dienstplanning.json"
    csv_path = Path(sys.argv[1]) if len(sys.argv) > 1 else root / "dienstplanning.csv"

    if not csv_path.exists():
        print(f"Gebruik: curl -sL '{CSV_URL}' -o dienstplanning.csv")
        print(f"        python3 scripts/update-dienstplanning.py dienstplanning.csv")
        sys.exit(1)

    rows = convert(csv_path)
    out.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"✓ {len(rows)} diensten geschreven naar {out}")


if __name__ == "__main__":
    main()
