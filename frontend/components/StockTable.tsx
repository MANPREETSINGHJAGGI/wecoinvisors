// File: frontend/components/StockTable.tsx
"use client";
import { useState } from "react";

interface Stock {
  symbol: string;
  company_name: string;
  current_price: string;
  change_pct: string;
  volume: string;
  sector: string;
  high_52: string;
  low_52: string;
  market_cap: string;
  pe_ratio: string;
  eps: string;
  source: string;
}

type SortKey = keyof Stock;

export default function StockTable({
  stocks,
  watchlist,
  setWatchlist,
}: {
  stocks: Stock[];
  watchlist: string[];
  setWatchlist: (s: string[]) => void;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("symbol");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const toggleWatchlist = (symbol: string) => {
    if (watchlist.includes(symbol)) {
      setWatchlist(watchlist.filter((s) => s !== symbol));
    } else {
      setWatchlist([...watchlist, symbol]);
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortedStocks = [...stocks].sort((a, b) => {
    const valA = a[sortKey] ?? "";
    const valB = b[sortKey] ?? "";

    // Try numeric compare first
    const numA = parseFloat(valA as string);
    const numB = parseFloat(valB as string);
    if (!isNaN(numA) && !isNaN(numB)) {
      return sortOrder === "asc" ? numA - numB : numB - numA;
    }

    // Fallback to string compare
    return sortOrder === "asc"
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  return (
    <div className="overflow-x-auto border border-gold rounded-lg shadow-lg">
      <table className="min-w-full text-sm text-wecoin-blue">
        {/* Table Header */}
        <thead className="sticky top-0 bg-black border-b border-gold text-gold text-xs uppercase tracking-wide">
          <tr>
            {[
              "symbol",
              "company_name",
              "current_price",
              "change_pct",
              "volume",
              "sector",
              "high_52",
              "low_52",
              "market_cap",
              "pe_ratio",
              "eps",
              "source",
            ].map((key) => (
              <th
                key={key}
                className="px-3 py-2 cursor-pointer select-none hover:bg-gold/20 text-center"
                onClick={() => handleSort(key as SortKey)}
              >
                {key.replace("_", " ").toUpperCase()}
                {sortKey === key ? (sortOrder === "asc" ? " ▲" : " ▼") : ""}
              </th>
            ))}
            <th className="px-3 py-2 text-center">⭐</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {sortedStocks.map((stock) => (
            <tr
              key={stock.symbol}
              className="border-b border-gold/30 hover:bg-black/50 transition text-center"
            >
              <td className="px-3 py-2 font-semibold">{stock.symbol}</td>
              <td className="px-3 py-2">{stock.company_name}</td>
              <td className="px-3 py-2 text-right">{stock.current_price}</td>
              <td
                className={`px-3 py-2 text-right font-bold ${
                  parseFloat(stock.change_pct) > 0
                    ? "text-green-400"
                    : parseFloat(stock.change_pct) < 0
                    ? "text-red-400"
                    : "text-gray-300"
                }`}
              >
                {stock.change_pct}%
              </td>
              <td className="px-3 py-2 text-right">{stock.volume}</td>
              <td className="px-3 py-2">{stock.sector}</td>
              <td className="px-3 py-2 text-right">{stock.high_52}</td>
              <td className="px-3 py-2 text-right">{stock.low_52}</td>
              <td className="px-3 py-2 text-right">{stock.market_cap}</td>
              <td className="px-3 py-2 text-right">{stock.pe_ratio}</td>
              <td className="px-3 py-2 text-right">{stock.eps}</td>
              <td className="px-3 py-2 underline text-blue-400">
                {stock.source}
              </td>
              <td
                className="px-3 py-2 text-center cursor-pointer text-lg"
                onClick={() => toggleWatchlist(stock.symbol)}
              >
                {watchlist.includes(stock.symbol) ? "★" : "☆"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
