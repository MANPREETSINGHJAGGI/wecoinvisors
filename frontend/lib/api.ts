const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export async function fetchLiveStockData(symbols: string) {
  const url = `${API_BASE}/api/live-stock-data?symbols=${symbols}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.statusText}`);
  }
  return res.json();
}
