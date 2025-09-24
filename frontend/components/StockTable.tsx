from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from .google_sheet_data import fetch_from_google_sheet

router = APIRouter()


@router.get("/live-stock-data")
async def live_stock_data(symbols: str = Query(..., description="Comma separated stock symbols")):
    """
    Fetch stock data only from Google Sheets.
    """
    try:
        raw_symbols = [s.strip().upper() for s in symbols.split(",") if s.strip()]

        sheet_data = fetch_from_google_sheet(raw_symbols)
        if not sheet_data:
            return {"data": [{"symbol": s, "error": "No data found in Google Sheet"} for s in raw_symbols]}

        # Tag source for clarity
        for row in sheet_data:
            row["source"] = "GoogleSheet"
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

        return {"data": sheet_data}

    except Exception as e:
        print(f"⚠️ Google Sheet fetch failed: {e}")
        return JSONResponse(content={"error": str(e)}, status_code=500)
