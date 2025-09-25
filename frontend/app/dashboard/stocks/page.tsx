"use client";

import { useState, useRef, useEffect } from "react";
import StockTable from "@/components/StockTable";
import Link from "next/link";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.wecoinvisors.com";

export default function StocksDashboard() {
  const [symbols, setSymbols] = useState("");
  const [stocks, setStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const normalizeSymbols = (input: string) => {
    return input
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean)
      .join(",");
  };

  const fetchStocks = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);

    try {
     const querySymbols = normalizeSymbols(query).split(",");
      const backendData = backendJson.data || [];
// keep API order as-is
// const orderedData = backendData;

// enforce query order
const orderedData = querySymbols.map((sym) =>
  backendData.find((d: any) => d.symbol.toUpperCase() === sym.toUpperCase())
).filter(Boolean);
setStocks(orderedData);
      const res = await fetch(
        `${API_BASE}/live-stock-data?symbols=${encodeURIComponent(querySymbols)}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const backendJson = await res.json();
if (backendJson.data && Array.isArray(backendJson.data)) {
  setStocks(backendJson.data); // ✅ assigns the array
} else {
  setStocks([]);
}

    } catch (err) {
      console.error("Fetch error", err);
      setError("⚠ Failed to fetch stock data. Try again.");
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!symbols.trim()) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    fetchStocks(symbols);
    intervalRef.current = setInterval(() => fetchStocks(symbols), 60000);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <main className="min-h-screen text-wecoin-blue glossy-bg">
      {/* Navbar */}
      <nav className="flex justify-between items-center py-4 px-6 bg-black/80 border-b border-gold backdrop-blur">
        <h1 className="text-2xl font-bold">📈 Stock Market Insights</h1>
        <Link
          href="/"
          className="text-sm border border-gold text-gold px-3 py-1 rounded hover:bg-gold hover:text-black transition"
        >
          ⬅ Back to Home
        </Link>
      </nav>

      {/* Search */}
      <section className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <h2 className="text-4xl font-extrabold mb-6 glow-text">
          Live Stock Dashboard
        </h2>
        <div className="bg-gray-900/80 border border-gold rounded-lg p-6 shadow-lg w-full max-w-2xl">
          <div className="flex items-center space-x-2 mb-4">
            <input
              type="text"
              placeholder="Enter symbols (e.g., ITC, PNB)"
              value={symbols}
              onChange={(e) => setSymbols(e.target.value)}
              className="bg-black border border-gold rounded px-3 py-2 text-wecoin-blue placeholder-blue-500 focus:outline-none flex-1"
            />
            <button
              onClick={handleSearch}
              className="bg-gold text-black px-4 py-2 rounded font-semibold hover:bg-yellow-500 transition"
            >
              Search
            </button>
          </div>
          <div className="text-sm italic text-wecoin-blue">
            Auto-refreshes every 60 seconds after fetch
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="px-6 pb-16">
        {loading && (
          <div className="py-6 text-center animate-pulse">
            ⏳ Loading stock prices...
          </div>
        )}
        {error && (
          <div className="py-4 text-center text-red-400 font-semibold">
            {error}
          </div>
        )}
        {!loading && !error && stocks.length > 0 && (
          <StockTable
            stocks={stocks}
            watchlist={watchlist}
            setWatchlist={setWatchlist}
          />
        )}
        {!loading && !error && stocks.length === 0 && (
          <div className="py-6 text-center text-gray-400 italic">
            🔍 Enter stock symbols above to see live data
          </div>
        )}
      </section>
    </main>
  );
}
