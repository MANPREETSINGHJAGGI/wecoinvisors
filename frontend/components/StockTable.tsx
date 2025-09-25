"use client";

import { useState } from "react";

interface Stock {
  symbol: string;
  company_name: string;
  current_price: string;
  change_pct: string;
  volume: string;
  sector: string;
  source: string;
}

export default function StockTable({
  stocks,
  watchlist,
  setWatchlist,
}: {
  stocks: Stock[];
  watchlist: string[];
  setWatchlist: (w: string[]) => void;
}) {
  const toggleWatchlist = (symbol: string) => {
    if (watchlist.includes(symbol)) {
      setWatchlist(watchlist.filter((s) => s !== symbol));
    } else {
      setWatchlist([...watchlist, symbol]);
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl shadow-lg border border-gold bg-black/70 backdrop-blur">
      <table className="w-full text-sm text-left text-wecoin-blue">
        <thead className="bg-gold text-black text-xs uppercase">
          <tr>
            <th className="px-4 py-3">Symbol</th>
            <th className="px-4 py-3">Company</th>
            <th className="px-4 py-3">Price (₹)</th>
            <th className="px-4 py-3">% Change</th>
            <th className="px-4 py-3">Volume</th>
            <th className="px-4 py-3">Sector</th>
            <th className="px-4 py-3">Source</th>
            <th className="px-4 py-3">⭐ Watchlist</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => (
            <tr
              key={stock.symbol}
              className="border-b border-gold/30 hover:bg-gold/10 transition"
            >
              <td className="px-4 py-2 font-bold">{stock.symbol}</td>
              <td className="px-4 py-2">{stock.company_name}</td>
              <td className="px-4 py-2">{stock.current_price}</td>
              <td
                className={`px-4 py-2 font-semibold ${
                  parseFloat(stock.change_pct) >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {stock.change_pct}%
              </td>
              <td className="px-4 py-2">{stock.volume}</td>
              <td className="px-4 py-2">{stock.sector}</td>
              <td className="px-4 py-2">{stock.source}</td>
              <td className="px-4 py-2">
                <button
                  onClick={() => toggleWatchlist(stock.symbol)}
                  className={`px-2 py-1 rounded ${
                    watchlist.includes(stock.symbol)
                      ? "bg-yellow-400 text-black"
                      : "bg-gray-800 text-white"
                  }`}
                >
                  {watchlist.includes(stock.symbol) ? "★" : "☆"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
