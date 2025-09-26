// File: frontend/components/StockTable.tsx
"use client";

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
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border border-gold text-wecoin-blue">
        <thead className="bg-black/70 border-b border-gold text-gold">
          <tr>
            <th className="px-3 py-2 text-left">Symbol</th>
            <th className="px-3 py-2 text-left">Company</th>
            <th className="px-3 py-2">Price (₹)</th>
            <th className="px-3 py-2">% Change</th>
            <th className="px-3 py-2">Volume</th>
            <th className="px-3 py-2">Sector</th>
            <th className="px-3 py-2">52W High</th>
            <th className="px-3 py-2">52W Low</th>
            <th className="px-3 py-2">Market Cap</th>
            <th className="px-3 py-2">P/E</th>
            <th className="px-3 py-2">EPS</th>
            <th className="px-3 py-2">Source</th>
            <th className="px-3 py-2">⭐</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((s) => (
            <tr key={s.symbol} className="border-b border-gray-800 hover:bg-black/40">
              <td className="px-3 py-2">{s.symbol}</td>
              <td className="px-3 py-2">{s.company_name}</td>
              <td className="px-3 py-2 font-bold">{s.current_price}</td>
              <td
                className={`px-3 py-2 ${
                  parseFloat(s.change_pct) >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {s.change_pct}%
              </td>
              <td className="px-3 py-2">{s.volume}</td>
              <td className="px-3 py-2">{s.sector}</td>
              <td className="px-3 py-2">{s.high_52}</td>
              <td className="px-3 py-2">{s.low_52}</td>
              <td className="px-3 py-2">{s.market_cap}</td>
              <td className="px-3 py-2">{s.pe_ratio}</td>
              <td className="px-3 py-2">{s.eps}</td>
              <td className="px-3 py-2">{s.source}</td>
              <td
                className="px-3 py-2 cursor-pointer"
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
