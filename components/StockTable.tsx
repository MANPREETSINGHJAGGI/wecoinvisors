"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Stock {
  symbol: string;
  name: string;
  price: number;
  volume: number;
  percentChange: number;
  sector: string;
  marketCap: number;
  peRatio: number;
  eps: number;
  isGolden?: boolean;
}

interface Props {
  stocks: Stock[];
  loading: boolean;
  watchlist: string[];
  setWatchlist: (list: string[]) => void;
}

export default function StockTable({
  stocks,
  loading,
  watchlist,
  setWatchlist,
}: Props) {
  const toggleWatchlist = (symbol: string) => {
    const updated = watchlist.includes(symbol)
      ? watchlist.filter((s) => s !== symbol)
      : [...watchlist, symbol];

    setWatchlist(updated);
    localStorage.setItem("watchlist", JSON.stringify(updated));
  };

  if (loading) {
    return (
      <div className="mt-6 space-y-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-dark border border-gray-800 rounded p-4"
          >
            <div className="h-4 bg-gray-800 w-1/3 mb-2 rounded" />
            <div className="h-3 bg-gray-700 w-2/3 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!Array.isArray(stocks)) {
    return <div className="text-red-500">⚠️ Invalid stock data received.</div>;
  }

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="min-w-full text-sm text-left text-grayText">
        <thead className="text-xs uppercase bg-dark border-b border-gold">
          <tr>
            <th className="px-4 py-2">⭐</th>
            <th className="px-4 py-2">Symbol</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Price</th>
            <th className="px-4 py-2">% Change</th>
            <th className="px-4 py-2">Sector</th>
            <th className="px-4 py-2">Chart</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => {
            const changeColor =
              stock.percentChange > 0
                ? "text-green-400"
                : stock.percentChange < 0
                ? "text-red-400"
                : "text-gray-400";

            const rowClass = stock.isGolden
              ? "bg-yellow-900/20 border-yellow-500"
              : "border-gray-800";

            return (
              <tr
                key={stock.symbol}
                className={`border-b hover:bg-gray-900 transition ${rowClass}`}
              >
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => toggleWatchlist(stock.symbol)}
                    className={stock.isGolden ? "text-yellow-400 text-lg" : "text-lg"}
                  >
                    {watchlist.includes(stock.symbol) ? "★" : "☆"}
                  </button>
                </td>
                <td className="px-4 py-2 font-bold text-gold">
                  <Link
                    href={`/dashboard/charts?symbol=${stock.symbol}`}
                    className="hover:underline"
                  >
                    {stock.symbol}
                  </Link>
                </td>
                <td className="px-4 py-2">{stock.name}</td>
                <td className="px-4 py-2">
                  {typeof stock.price === "number" ? stock.price.toFixed(2) : "N/A"}
                </td>
                <td className={`px-4 py-2 ${changeColor}`}>
                  {typeof stock.percentChange === "number"
                    ? `${stock.percentChange.toFixed(2)}%`
                    : "N/A"}
                </td>
                <td className="px-4 py-2">{stock.sector}</td>
                <td className="px-4 py-2">
                  <Link
                    href={`/dashboard/charts?symbol=${stock.symbol}`}
                    className="text-blue-500 hover:underline"
                  >
                    View Chart
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
