"use client";

import React from "react";

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
  if (!stocks || stocks.length === 0) {
    return (
      <div className="text-center text-gray-400 py-6">
        No stock data available. Try searching symbols like <b>PNB, TCS</b>.
      </div>
    );
  }

  // Define headers for the table
  const headers = [
    "Symbol",
    "Company Name",
    "Current Price",
    "PrevClose",
    "PriceOpen",
    "ChangePct",
    "High",
    "Low",
    "ExpenseRatio",
    "MorningStarRating",
    "Volume",
    "Market Cap (₹ Crore, Approx)",
    "TradeTime",
    "DataDelay",
    "VolumeAvg",
    "PE",
    "EPS",
    "High52",
    "Low52",
    "Change",
    "Beta",
    "Shares",
    "Currency",
    "Sector",
  ];

  // Map frontend headers → backend API keys
  const headerMapping: Record<string, string> = {
    "Symbol": "symbol",
    "Company Name": "company_name",
    "Current Price": "current_price",
    "PrevClose": "prev_close",
    "PriceOpen": "price_open",
    "ChangePct": "change_pct",
    "High": "day_high",
    "Low": "day_low",
    "ExpenseRatio": "expense_ratio",
    "MorningStarRating": "morningstar_rating",
    "Volume": "volume",
    "Market Cap (₹ Crore, Approx)": "market_cap",
    "TradeTime": "trade_time",
    "DataDelay": "data_delay",
    "VolumeAvg": "avg_volume",
    "PE": "pe_ratio",
    "EPS": "eps",
    "High52": "high_52",
    "Low52": "low_52",
    "Change": "change",
    "Beta": "beta",
    "Shares": "shares",
    "Currency": "currency",
    "Sector": "sector",
  };

  const toggleWatchlist = (symbol: string) => {
    if (watchlist.includes(symbol)) {
      setWatchlist(watchlist.filter((s) => s !== symbol));
    } else {
      setWatchlist([...watchlist, symbol]);
    }
  };

  return (
    <div className="overflow-x-auto border border-gold rounded-lg shadow-lg">
      <table className="min-w-full border border-gold text-wecoin-blue">
        <thead>
          <tr>
            {headers.map((header) => (
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
          {stocks.map((stock, idx) => (
            <tr
              key={idx}
              className="hover:bg-black/40 transition text-center"
            >
              {headers.map((header) => {
                const key = headerMapping[header];
                return (
                  <td
                    key={header}
                    className="px-4 py-2 border border-gold text-sm"
                  >
                    {stock[key] || "-"}
                  </td>
                );
              })}
              <td className="px-4 py-2 border border-gold">
                <button
                  onClick={() => toggleWatchlist(stock.symbol)}
                  className="text-lg"
                >
                  {watchlist.includes(stock.symbol) ? "⭐" : "☆"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
