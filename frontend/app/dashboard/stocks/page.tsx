"use client";

import { useState, useEffect } from "react";
import LiveMarketData from "@/components/LiveMarketData";
import StockTable from "@/components/StockTable";
import Link from "next/link";

export default function StocksDashboard() {
  const [mode, setMode] = useState<"default" | "custom">("default");
  const [symbols, setSymbols] = useState("");
  const [stocks, setStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>([]);

  useEffect(() => {
    if (mode === "default") {
      fetchDefault();
      const interval = setInterval(fetchDefault, 30000);
      return () => clearInterval(interval);
    }
  }, [mode]);

  const fetchDefault = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "http://127.0.0.1:8000/api/live-stock-data?symbols=RELIANCE.NS,TCS.NS,HDFCBANK.NS,INFY.NS"
      );
      const data = await res.json();
      setStocks(data);
    } catch (err) {
      console.error("Error fetching default stocks", err);
    }
    setLoading(false);
  };

  const fetchCustom = async () => {
    if (!symbols.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/live-stock-data?symbols=${symbols}`
      );
      const data = await res.json();
      setStocks(data);
    } catch (err) {
      console.error("Error fetching custom stocks", err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black-glossy text-blue-glow p-6 font-sans">
      {/* Header with Golden Tabs */}
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

      {/* Stock Mode Toggle */}
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

        {loading ? (
          <div className="py-6 text-center animate-pulse">⏳ Loading stock prices...</div>
        ) : (
          <StockTable
            stocks={stocks}
            loading={loading}
            watchlist={watchlist}
            setWatchlist={setWatchlist}
          />
        )}
      </div>

      {/* FPI Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-black-glossy border border-gold rounded-lg p-4 shadow-lg">
          <h2 className="text-xl font-semibold mb-3 text-blue-glow">📊 FPI Trends</h2>
          <div className="h-48 flex items-center justify-center text-gold/50">
            Line Chart Placeholder
          </div>
        </div>
        <div className="bg-black-glossy border border-gold rounded-lg p-4 shadow-lg">
          <h2 className="text-xl font-semibold mb-3 text-blue-glow">💰 FPI Allocation</h2>
          <div className="h-48 flex items-center justify-center text-gold/50">
            Pie Chart Placeholder
          </div>
        </div>
      </div>

      {/* Investment Tips */}
      <div className="bg-black-glossy border border-gold rounded-lg p-4 shadow-lg">
        <h2 className="text-xl font-semibold mb-3 text-blue-glow">💡 Investment Tips</h2>
        <ul className="list-disc list-inside space-y-1 text-gold/90">
          <li>Diversify your portfolio to reduce risk.</li>
          <li>Stay updated with company fundamentals.</li>
          <li>Use stop-loss to manage downside risk.</li>
        </ul>
      </div>
    </div>
  );
}
