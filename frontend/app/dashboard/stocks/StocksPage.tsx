"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Stock {
  symbol: string;
  price: number;
  percentChange: number;
  volume: number;
}

export default function StocksPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStocks = async () => {
    setIsLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
      const res = await fetch(`${baseUrl}/api/live-stock-data`);
      if (!res.ok) throw new Error("Failed to fetch stocks");
      const json = await res.json();

      if (Array.isArray(json)) {
        setStocks(json);
      } else if (json.data) {
        setStocks(json.data);
      } else {
        throw new Error("Invalid data format");
      }

      setError(null);
    } catch (err: any) {
      console.error("Error fetching stocks:", err);
      setError(err.message || "Failed to load stocks");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on mount and refresh every 30s
  useEffect(() => {
    fetchStocks();
    const interval = setInterval(fetchStocks, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">📊 Live Stocks</h1>

      {isLoading && <p className="text-gray-400">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left border border-gray-700 mt-4">
          <thead className="bg-gray-900 text-gray-200">
            <tr>
              <th className="px-3 py-2">Symbol</th>
              <th className="px-3 py-2">Price</th>
              <th className="px-3 py-2">% Change</th>
              <th className="px-3 py-2">Volume</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock, idx) => {
              const changeColor =
                stock.percentChange > 0
                  ? "text-green-500"
                  : stock.percentChange < 0
                  ? "text-red-500"
                  : "text-gray-400";

              return (
                <tr
                  key={idx}
                  className="border-b border-gray-800 hover:bg-gray-800 transition"
                >
                  <td className="px-3 py-2 font-bold">{stock.symbol}</td>
                  <td className="px-3 py-2">{stock.price?.toFixed(2) ?? "N/A"}</td>
                  <td className={`px-3 py-2 ${changeColor}`}>
                    {stock.percentChange?.toFixed(2) ?? 0}%
                  </td>
                  <td className="px-3 py-2">
                    {stock.volume?.toLocaleString() ?? "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-8 text-center">
        <Link href="/" className="text-blue-500 hover:underline text-sm">
          ← Back to Homepage
        </Link>
      </div>
    </main>
  );
}
