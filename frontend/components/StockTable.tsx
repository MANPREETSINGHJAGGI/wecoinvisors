"use client";

import React from "react";

type Stock = {
  symbol: string;
  company_name: string;
  current_price: string;
  change_pct: string;
  volume: string;
  sector: string;
  source: string;
  trade_time: string;
  day_high: string;
  day_low: string;
  high_52: string;
  low_52: string;
  market_cap: string;
  pe_ratio: string;
  eps: string;
};

export default function StockTable({
  stocks,
  watchlist,
  setWatchlist,
}: {
  stocks: Stock[];
  watchlist: string[];
  setWatchlist: (w: string[]) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gold text-sm text-wecoin-blue bg-black/70">
        <thead className="bg-gold text-black text-xs uppercase">
          <tr>
            <th className="px-2 py-2 border border-gold">Symbol</th>
            <th className="px-2 py-2 border border-gold">Company</th>
            <th className="px-2 py-2 border border-gold">Price (₹)</th>
            <th className="px-2 py-2 border border-gold">% Change</th>
            <th className="px-2 py-2 border border-gold">Volume</th>
            <th className="px-2 py-2 border border-gold">Sector</th>
            <th className="px-2 py-2 border border-gold">52W High</th>
            <th className="px-2 py-2 border border-gold">52W Low</th>
            <th className="px-2 py-2 border border-gold">Market Cap</th>
            <th className="px-2 py-2 border border-gold">P/E</th>
            <th className="px-2 py-2 border border-gold">EPS</th>
            <th className="px-2 py-2 border border-gold">Source</th>
            <th className="px-2 py-2 border border-gold">⭐ Watchlist</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((s) => (
            <tr
              key={s.symbol}
              className="hover:bg-gold/10 transition border-b border-gold"
            >
              <td className="px-2 py-2 border border-gold">{s.symbol}</td>
              <td className="px-2 py-2 border border-gold">{s.company_name}</td>
              <td className="px-2 py-2 border border-gold">{s.current_price}</td>
              <td
                className={`px-2 py-2 border border-gold ${
                  parseFloat(s.change_pct) >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {s.change_pct}%
              </td>
              <td className="px-2 py-2 border border-gold">{s.volume}</td>
              <td className="px-2 py-2 border border-gold">{s.sector}</td>
              <td className="px-2 py-2 border border-gold">{s.high_52}</td>
              <td className="px-2 py-2 border border-gold">{s.low_52}</td>
              <td className="px-2 py-2 border border-gold">{s.market_cap}</td>
              <td className="px-2 py-2 border border-gold">{s.pe_ratio}</td>
              <td className="px-2 py-2 border border-gold">{s.eps}</td>
              <td className="px-2 py-2 border border-gold">{s.source}</td>
              <td className="px-2 py-2 border border-gold text-center">
                <button
                  onClick={() => {
                    if (watchlist.includes(s.symbol)) {
                      setWatchlist(watchlist.filter((w) => w !== s.symbol));
                    } else {
                      setWatchlist([...watchlist, s.symbol]);
                    }
                  }}
                  className={`px-2 py-1 rounded ${
                    watchlist.includes(s.symbol)
                      ? "bg-gold text-black"
                      : "bg-gray-700 text-white"
                  }`}
                >
                  {watchlist.includes(s.symbol) ? "★" : "☆"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
