// File: frontend/components/StockTable.tsx

"use client";
import { useState } from "react";

interface Stock {
  symbol: string;
  company_name: string;
  current_price: string;
  prev_close?: string;
  change_pct: string;
  volume: string;
  sector: string;
  high_52: string;
  low_52: string;
  market_cap: string;
  pe_ratio: string;
  eps: string;
  shares?: string;
  source: string;
}

type SortKey = keyof Stock | "amount_change" | "market_cap_cr" | "shares_cr";

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
    if (sortKey === key) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  // Derived calculated fields
  const processedStocks = stocks.map((s) => {
    const prev = parseFloat(s.prev_close ?? "0");
    const curr = parseFloat(s.current_price ?? "0");
    const mcapCr = parseFloat(s.market_cap ?? "0") / 100; // ₹ crore approx
    const amountChange = prev ? curr - prev : 0;
    const sharesCr = parseFloat(s.shares ?? "0") / 1e7; // from raw to crore
    return { ...s, amount_change: amountChange, market_cap_cr: mcapCr, shares_cr: sharesCr };
  });

  const sortedStocks = [...processedStocks].sort((a, b) => {
    const valA = a[sortKey] ?? "";
    const valB = b[sortKey] ?? "";
    const numA = parseFloat(valA as string);
    const numB = parseFloat(valB as string);
    if (!isNaN(numA) && !isNaN(numB))
      return sortOrder === "asc" ? numA - numB : numB - numA;
    return sortOrder === "asc"
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  return (
    <div className="overflow-x-auto border border-gold rounded-lg shadow-lg">
      <table className="min-w-full text-sm text-wecoin-blue table-fixed">
        {/* Table Header */}
        <thead className="sticky top-0 bg-black border-b border-gold text-gold text-xs uppercase tracking-wide">
          <tr>
            {[
              { key: "symbol", label: "Symbol" },
              { key: "company_name", label: "Company Name" },
              { key: "current_price", label: "Price (₹)" },
              { key: "amount_change", label: "Amount (+/-)" },
              { key: "change_pct", label: "% Change" },
              { key: "volume", label: "Volume" },
              { key: "sector", label: "Sector" },
              { key: "high_52", label: "52W High" },
              { key: "low_52", label: "52W Low" },
              { key: "market_cap_cr", label: "Market Cap (₹ Cr)" },
              { key: "shares_cr", label: "Shares (Cr)" },
              { key: "pe_ratio", label: "P/E" },
              { key: "eps", label: "EPS" },
              { key: "source", label: "Source" },
            ].map(({ key, label }) => (
              <th
                key={key}
                className="px-3 py-2 text-left cursor-pointer select-none hover:bg-gold/20"
                onClick={() => handleSort(key as SortKey)}
              >
                {label}
                {sortKey === key ? (sortOrder === "asc" ? " ▲" : " ▼") : ""}
              </th>
            ))}
            <th className="px-3 py-2 text-center">⭐</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {sortedStocks.map((s) => (
            <tr
              key={s.symbol}
              className="border-b border-gold/30 hover:bg-black/50 transition"
            >
              <td className="px-3 py-2 font-semibold">{s.symbol}</td>
              <td className="px-3 py-2">{s.company_name}</td>
              <td className="px-3 py-2 text-right">{s.current_price}</td>
              <td
                className={`px-3 py-2 text-right ${
                  s.amount_change > 0
                    ? "text-green-400"
                    : s.amount_change < 0
                    ? "text-red-400"
                    : "text-gray-300"
                }`}
              >
                {s.amount_change.toFixed(2)}
              </td>
              <td
                className={`px-3 py-2 text-right font-bold ${
                  parseFloat(s.change_pct) > 0
                    ? "text-green-400"
                    : parseFloat(s.change_pct) < 0
                    ? "text-red-400"
                    : "text-gray-300"
                }`}
              >
                {s.change_pct}%
              </td>
              <td className="px-3 py-2 text-right">{s.volume}</td>
              <td className="px-3 py-2">{s.sector}</td>
              <td className="px-3 py-2 text-right">{s.high_52}</td>
              <td className="px-3 py-2 text-right">{s.low_52}</td>
              <td className="px-3 py-2 text-right">{s.market_cap_cr.toFixed(2)}</td>
              <td className="px-3 py-2 text-right">{s.shares_cr.toFixed(2)}</td>
              <td className="px-3 py-2 text-right">{s.pe_ratio}</td>
              <td className="px-3 py-2 text-right">{s.eps}</td>
              <td className="px-3 py-2 text-left underline text-blue-400">
                {s.source}
              </td>
              <td
                className="px-3 py-2 text-center cursor-pointer text-lg"
                onClick={() => toggleWatchlist(s.symbol)}
              >
                {watchlist.includes(s.symbol) ? "★" : "☆"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
