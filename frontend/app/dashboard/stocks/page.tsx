"use client";

import { useState, useRef, useEffect } from "react";
import StockTable from "@/components/StockTable";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";


  export default function StocksDashboard() {
  const [symbols, setSymbols] = useState("");
  const [stocks, setStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

   /** Normalize → uppercase + NSE suffix */
  const normalizeSymbols = (input: string) => {
    return input
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean)
      .map((s) => (s.includes(".") ? s : `${s}.NS`))
      .join(",");
  };

  /** Fetch live data */
  const fetchStocks = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const querySymbols = normalizeSymbols(query);
      const res = await fetch(
        `${API_BASE}/live-stock-data?symbols=${encodeURIComponent(querySymbols)}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const backendJson = await res.json();
      const backendData = backendJson.data || [];
      setStocks(backendData);
    } catch (err) {
      console.error("Fetch error", err);
      setError("⚠ Failed to fetch stock data. Try again.");
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  /** Handle Search */
  const handleSearch = () => {
    if (!symbols.trim()) return;
    fetchStocks(symbols);

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      fetchStocks(symbols);
    }, 30000); // auto-refresh 30s
  };

  /** Cleanup interval on unmount */
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

      {/* Search Section */}
      <section className="flex flex-col items-center justify-center py-16 px-6 text-center">
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
            Auto-refreshes every 30 seconds after fetch
          </div>
        </div>
      </section>

      {/* Stock Table */}
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
            loading={loading}
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

      {/* Footer */}
      <footer className="bg-black/80 text-center py-8 border-t border-gold backdrop-blur">
        <div className="mb-2 text-sm">
          © {new Date().getFullYear()} WeCoinvisors Pvt Ltd. All rights reserved.
        </div>
        <div className="space-x-4 text-sm">
          <a href="/about" className="nav-link">
            About
          </a>
          <a href="/contact" className="nav-link">
            Contact
          </a>
          <a href="/terms" className="nav-link">
            Terms
          </a>
        </div>
      </footer>
    </main>
  );
}

				
