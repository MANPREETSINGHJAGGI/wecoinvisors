// File: frontend/app/dashboard/stocks/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import StockTable from "@/components/StockTable";
import Link from "next/link";
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export default function StocksPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/live-stock-data?symbols=PNB,ITC`, {
          cache: "no-store",
        });
        const json = await res.json();
        setData(json.data || []);
      } catch (err) {
        console.error("⚠️ Failed to fetch stock data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-4">📊 Live Stocks</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-800">
            <th className="p-2">Symbol</th>
            <th className="p-2">Company</th>
            <th className="p-2">Price</th>
            <th className="p-2">% Change</th>
            <th className="p-2">Sector</th>
          </tr>
        </thead>
        <tbody>
          {data.map((stock, i) => (
            <tr key={i} className="border-b">
              <td className="p-2">{stock.symbol}</td>
              <td className="p-2">{stock.company_name}</td>
              <td className="p-2">{stock.current_price}</td>
              <td
                className={`p-2 ${
                  parseFloat(stock.change_pct) >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {stock.change_pct}%
              </td>
              <td className="p-2">{stock.sector}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
