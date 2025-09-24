"use client";

import React, { useState } from "react";

interface StockTableProps {
  stocks: any[];
  loading: boolean;
  watchlist: string[];
  setWatchlist: (symbols: string[]) => void;
}

export default function StockTable({
  stocks,
  loading,
  watchlist,
  setWatchlist,
}: StockTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  if (loading) {
    return <div className="text-center text-gray-400 py-6">Loading data...</div>;
  }

  if (!stocks || stocks.length === 0) {
    return (
      <div className="text-center text-gray-400 py-6">
        No stock data available. Try searching symbols like <b>PNB, TCS</b>.
      </div>
    );
  }

  // Ensure all rows have consistent keys
  const headers = Array.from(new Set(stocks.flatMap((s) => Object.keys(s))));

  // Always move Symbol first, Source last, Error last
  const sortedHeaders = [
    "Symbol",
    ...headers.filter((h) => !["Symbol", "Source", "Error"].includes(h)),
    "Source",
    "Error",
  ].filter((h, i, arr) => arr.indexOf(h) === i); // remove duplicates

  // 🔎 Filter stocks dynamically based on search query (all columns searchable)
  const filteredStocks = stocks.filter((stock) =>
    Object.values(stock).some((value) =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const toggleWatchlist = (symbol: string) => {
    if (watchlist.includes(symbol)) {
      setWatchlist(watchlist.filter((s) => s !== symbol));
    } else {
      setWatchlist([...watchlist, symbol]);
    }
  };

  return (
    <div>
      {/* 🔎 Search Bar */}
      <div className="mb-4 flex justify-end">
        <input
          type="text"
          placeholder="Search stocks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3 py-2 border border-gold rounded-md text-sm w-64 text-wecoin-blue"
        />
      </div>

      {/* 📊 Stock Table */}
      <div className="overflow-x-auto border border-gold rounded-lg shadow-lg">
        <table className="min-w-full border border-gold text-wecoin-blue">
          <thead>
            <tr>
              {sortedHeaders.map((header) => (
                <th
                  key={header}
                  className="px-4 py-2 border border-gold bg-black/70 text-gold text-sm font-bold"
                >
                  {header}
                </th>
              ))}
              <th className="px-4 py-2 border border-gold bg-black/70 text-gold text-sm font-bold">
                ⭐ Watchlist
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredStocks.map((stock, idx) => (
              <tr
                key={idx}
                className={`hover:bg-black/40 transition text-center ${
                  stock["Error"] ? "text-red-400" : ""
                }`}
              >
                {sortedHeaders.map((header) => (
                  <td
                    key={header}
                    className="px-4 py-2 border border-gold text-sm"
                  >
                    {stock[header] !== undefined && stock[header] !== null
                      ? stock[header]
                      : "-"}
                  </td>
                ))}
                <td className="px-4 py-2 border border-gold">
                  <button
                    onClick={() => toggleWatchlist(stock["Symbol"])}
                    className="text-lg"
                    disabled={!!stock["Error"]}
                  >
                    {watchlist.includes(stock["Symbol"]) ? "⭐" : "☆"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
