"use client";

import { useEffect, useState } from "react";

interface LiveMarketDataProps {
  provider?: string; // Optional prop
}

export default function LiveMarketData({ provider = "dual" }: LiveMarketDataProps) {
  const [stocks, setStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/live-stock-data?provider=${provider}`);
        if (!res.ok) throw new Error("Failed to fetch market data");
        const json = await res.json();
        setStocks(Array.isArray(json) ? json : json.data || []);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [provider]);

  if (loading) return <p className="text-gray-500">Loading market data...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-left text-gray-700 dark:text-gray-200">
        <thead className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100">
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
              <tr key={idx} className="border-b dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                <td className="px-3 py-2 font-bold">{stock.symbol}</td>
                <td className="px-3 py-2">{stock.price?.toFixed(2) ?? "N/A"}</td>
                <td className={`px-3 py-2 ${changeColor}`}>
                  {stock.percentChange?.toFixed(2) ?? 0}%
                </td>
                <td className="px-3 py-2">{stock.volume?.toLocaleString() ?? "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
