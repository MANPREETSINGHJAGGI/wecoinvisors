"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export default function StockSearch() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function searchStock() {
    if (!query.trim()) return;

    setError(null);
    setResult(null);

    try {
      const res = await fetch(
        `${API_BASE}/live-stock-data?symbols=${encodeURIComponent(query)}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      if (json.data && json.data.length > 0) {
        setResult(json.data[0]); // first match
      } else {
        setError("⚠ No data found for this symbol.");
      }
    } catch (err: any) {
      console.error("Search error:", err);
      setError("⚠ Failed to fetch stock data.");
    }
  }

  return (
    <div className="mt-6 w-full max-w-md mx-auto">
      <input
        type="text"
        placeholder="Enter Stock Symbol (e.g., PNB, ITC)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="p-2 border w-full rounded text-black"
      />
      <button
        onClick={searchStock}
        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Search
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {result && !error && (
        <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded shadow">
          <h3 className="text-lg font-semibold">{result.symbol}</h3>
          <p>Price: ₹{result.current_price || "-"}</p>
          <p>Change: {result.change || "-"} ({result.change_pct || "-"})</p>
          <p>Sector: {result.sector || "-"}</p>
          <p>Source: {result.source || "GoogleSheet"}</p>
        </div>
      )}
    </div>
  );
}
