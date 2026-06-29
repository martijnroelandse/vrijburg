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
    "1imjMr9ELUHGV9331mYIoTOUc-DizOysV/edit?usp=sharing"
)

LOC_CODES = {
    "th": "Thomaskerk",
    "zw": "Willem de Zwijger",
    "or": "Oranjekerk",
}

VL_TYPES = ("VLV", "VLH", "VLZ")


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


def parse_vl_value(raw):
    """Zet spreadsheet-waarde om naar VLV/VLH/VLZ veld."""
    v = clean(raw)
    if not v:
        return None, ""
    upper = v.upper()
    for code in VL_TYPES:
        if upper == code:
            return code.lower(), "ja"
        if upper == f"{code}?":
            return code.lower(), "?"
    # Waarde staat in verkeerde kolom (bijv. VLH in VLV-kolom)
    for code in VL_TYPES:
        if upper.startswith(code):
            return code.lower(), v
    return None, v


def assign_vl_fields(row):
    """Lees VLV, VLH, VLZ kolommen; corrigeer verkeerd geplaatste codes."""
    vl = {"vlv": "", "vlh": "", "vlz": ""}
    columns = [
        ("vlv", ("VLV", "V.L.Voorgaan")),
        ("vlh", ("VLH", "V.L.Horen ♫♫ ")),
        ("vlz", ("VLZ", "V.L.Zien")),
    ]
    for target, keys in columns:
        raw = get_col(row, *keys)
        if not raw:
            continue
        code, value = parse_vl_value(raw)
        if code:
            vl[code] = value or "ja"
        else:
            vl[target] = raw
    return vl


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
            vl = assign_vl_fields(r)

            bijz = list(extra)
            avondmaal = get_col(r, "Avondmaal")
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
                "vlv": vl["vlv"],
                "vlh": vl["vlh"],
                "vlz": vl["vlz"],
                "avondmaal": avondmaal,
                "bijzonderheden": "\n".join(bijz),
            })
    return rows


def main():
    root = Path(__file__).resolve().parents[1]
    out = root / "dienstplanning.json"
    csv_path = Path(sys.argv[1]) if len(sys.argv) > 1 else root / "dienstplanning.csv"

    if not csv_path.exists():
        print(f"Gebruik: python3 scripts/update-dienstplanning.py dienstplanning-2026.csv")
        sys.exit(1)

    rows = convert(csv_path)
    out.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"✓ {len(rows)} diensten geschreven naar {out}")


if __name__ == "__main__":
    main()
