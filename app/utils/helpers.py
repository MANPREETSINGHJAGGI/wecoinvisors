# backend/app/utils/helpers.py
def is_indian_stock(symbol: str) -> bool:
    return symbol.upper().endswith(".NS")

def normalize_symbols(raw: str) -> list[str]:
    out: list[str] = []
    for s in [x.strip().upper() for x in raw.split(",") if x.strip()]:
        if "." not in s:
            out.append(f"{s}.NS")
        else:
            out.append(s)
    return out
