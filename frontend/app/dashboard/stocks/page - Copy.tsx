"use client";

import { useState, useEffect } from "react";
import LiveMarketData from "@/components/LiveMarketData";
import StockTable from "@/components/StockTable";
import Link from "next/link";

const API_BASE = "/api"; // go through Next.js route so shapes are normalized

export default function StocksDashboard() {
  const [mode, setMode] = useState<"default" | "custom">("default");
  const [symbols, setSymbols] = useState("");
  const [stocks, setStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>([]);

  useEffect(() => {
    if (mode === "default") {
      fetchDefault();
      const interval = setInterval(fetchDefault, 30000); // 30 sec refresh
      return () => clearInterval(interval);
    }
  }, [mode]);

  const fetchDefault = async () => {
    setLoading(true);
    setError(null);
    try {
      // Default fetcher — use a safe default list when input is empty
async function fetchDefault() {
  setLoading(true);
  setError(null);
  try {
    const defaultSymbols = "RELIANCE.NS,TCS.NS,INFY.NS,AAPL";
    const querySymbols = symbols.trim() || defaultSymbols;

    const res = await fetch(
      `${API_BASE}/live-stock-data?provider=backend&symbols=${encodeURIComponent(querySymbols)}`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    // Accept either {data: [...]} or [...] just in case
    setStocks(Array.isArray(json) ? json : (json.data || []));
  } catch (err) {
    console.error("Error fetching default stocks", err);
    setError("Failed to fetch market data");
    setStocks([]);
  } finally {
    setLoading(false);
  }
}

// Custom fetcher — same JSON handling
async function fetchCustom() {
  if (!symbols.trim()) return;
  setLoading(true);
  setError(null);
  try {
    const res = await fetch(
      `${API_BASE}/live-stock-data?provider=backend&symbols=${encodeURIComponent(symbols)}`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    setStocks(Array.isArray(json) ? json : (json.data || []));
  } catch (err) {
    console.error("Error fetching custom stocks", err);
    setError("Failed to fetch custom stock data");
    setStocks([]);
  } finally {
    setLoading(false);
  }
}


      if (!res.ok) throw new Error(`Error: ${res.statusText}`);
      const json = await res.json();
      setStocks(data || []);
    } catch (err: any) {
      console.error("Error fetching default stocks", err);
      setError("Failed to fetch market data");
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustom = async () => {
    if (!symbols.trim()) return;
    setLoading(true);
    setError(null);
    try {
     // Default fetcher — use a safe default list when input is empty
async function fetchDefault() {
  setLoading(true);
  setError(null);
  try {
    const defaultSymbols = "RELIANCE.NS,TCS.NS,INFY.NS,AAPL";
    const querySymbols = symbols.trim() || defaultSymbols;

    const res = await fetch(
      `${API_BASE}/live-stock-data?provider=backend&symbols=${encodeURIComponent(querySymbols)}`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    // Accept either {data: [...]} or [...] just in case
    setStocks(Array.isArray(json) ? json : (json.data || []));
  } catch (err) {
    console.error("Error fetching default stocks", err);
    setError("Failed to fetch market data");
    setStocks([]);
  } finally {
    setLoading(false);
  }
}

// Custom fetcher — same JSON handling
async function fetchCustom() {
  if (!symbols.trim()) return;
  setLoading(true);
  setError(null);
  try {
    const res = await fetch(
      `${API_BASE}/live-stock-data?provider=backend&symbols=${encodeURIComponent(symbols)}`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    setStocks(Array.isArray(json) ? json : (json.data || []));
  } catch (err) {
    console.error("Error fetching custom stocks", err);
    setError("Failed to fetch custom stock data");
    setStocks([]);
  } finally {
    setLoading(false);
  }
}

      if (!res.ok) throw new Error(`Error: ${res.statusText}`);
      const data = await res.json();
      setStocks(data || []);
    } catch (err: any) {
      console.error("Error fetching custom stocks", err);
      setError("Failed to fetch custom stock data");
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black-glossy text-blue-glow p-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gold pb-4 mb-6">
        <h1 className="text-3xl font-bold text-blue-glow">
          📈 Stock Market Insights
        </h1>
        <Link
          href="/"
          className="text-sm border border-gold text-gold px-3 py-1 rounded hover:bg-gold hover:text-black transition"
        >
          ⬅ Back to Home
        </Link>
      </div>

      {/* Live Market Overview */}
      <div className="mb-6">
        <LiveMarketData />
      </div>

      {/* Mode Toggle */}
      <div className="bg-black-glossy border border-gold rounded-lg p-4 shadow-lg mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="space-x-6">
            <label className="cursor-pointer text-gold">
              <input
                type="radio"
                name="stockMode"
                checked={mode === "default"}
                onChange={() => setMode("default")}
                className="accent-gold"
              />{" "}
              Live Refresh Mode
            </label>
            <label className="cursor-pointer text-gold">
              <input
                type="radio"
                name="stockMode"
                checked={mode === "custom"}
                onChange={() => setMode("custom")}
                className="accent-gold"
              />{" "}
              Custom Mode
            </label>
          </div>

          {mode === "custom" && (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="RELIANCE.NS,TCS.NS"
                value={symbols}
                onChange={(e) => setSymbols(e.target.value)}
                className="bg-black-glossy border border-gold rounded px-3 py-1 text-gold placeholder-gold/50 focus:outline-none"
              />
              <button
                onClick={fetchCustom}
                className="bg-gold text-black px-3 py-1 rounded hover:opacity-80 transition"
              >
                Fetch
              </button>
            </div>
          )}
        </div>

        <div className="text-sm italic text-gold/70 mb-3">
          {mode === "default"
            ? "Auto-refreshing every 30 seconds"
            : `Showing custom stocks: ${symbols || "None"}`}
        </div>

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
        {!loading && !error && (
          <StockTable
            stocks={stocks}
            loading={loading}
            watchlist={watchlist}
            setWatchlist={setWatchlist}
          />
        )}
      </div>

      {/* Placeholder Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-black-glossy border border-gold rounded-lg p-4 shadow-lg">
          <h2 className="text-xl font-semibold mb-3 text-blue-glow">
            📊 FPI Trends
          </h2>
          <div className="h-48 flex items-center justify-center text-gold/50">
            Line Chart Placeholder
          </div>
        </div>
        <div className="bg-black-glossy border border-gold rounded-lg p-4 shadow-lg">
          <h2 className="text-xl font-semibold mb-3 text-blue-glow">
            💰 FPI Allocation
          </h2>
          <div className="h-48 flex items-center justify-center text-gold/50">
            Pie Chart Placeholder
          </div>
        </div>
      </div>

      <div className="bg-black-glossy border border-gold rounded-lg p-4 shadow-lg">
        <h2 className="text-xl font-semibold mb-3 text-blue-glow">
          💡 Investment Tips
        </h2>
        <ul className="list-disc list-inside space-y-1 text-gold/90">
          <li>Diversify your portfolio to reduce risk.</li>
          <li>Stay updated with company fundamentals.</li>
          <li>Use stop-loss to manage downside risk.</li>
        </ul>
      </div>
    </div>
  );
}
