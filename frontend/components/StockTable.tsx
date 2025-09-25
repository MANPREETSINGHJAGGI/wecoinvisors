"use client";

type Stock = {
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
};

interface Props {
  stocks: Stock[];
  watchlist: string[];
  setWatchlist: (w: string[]) => void;
}

export default function StockTable({ stocks, watchlist, setWatchlist }: Props) {
  const toggleWatchlist = (symbol: string) => {
    if (watchlist.includes(symbol)) {
      setWatchlist(watchlist.filter((s) => s !== symbol));
    } else {
      setWatchlist([...watchlist, symbol]);
    }
  };

  return (
    <div className="overflow-x-auto bg-black/70 border border-gold rounded-lg shadow-lg">
      <table className="min-w-full border-collapse text-sm text-wecoin-blue">
        <thead className="bg-black/80 border-b border-gold text-gold">
          <tr>
            <th className="px-3 py-2 text-left">Symbol</th>
            <th className="px-3 py-2 text-left">Company</th>
            <th className="px-3 py-2 text-right">Price (₹)</th>
            <th className="px-3 py-2 text-right">% Change</th>
            <th className="px-3 py-2 text-right">Volume</th>
            <th className="px-3 py-2 text-left">Sector</th>
            <th className="px-3 py-2 text-right">52W High</th>
            <th className="px-3 py-2 text-right">52W Low</th>
            <th className="px-3 py-2 text-right">Market Cap</th>
            <th className="px-3 py-2 text-right">P/E</th>
            <th className="px-3 py-2 text-right">EPS</th>
            <th className="px-3 py-2 text-left">Source</th>
            <th className="px-3 py-2 text-center">⭐</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((s, idx) => (
            <tr key={idx} className="border-b border-gold hover:bg-gold/10">
              <td className="px-3 py-2">{s.symbol}</td>
              <td className="px-3 py-2">{s.company_name}</td>
              <td className="px-3 py-2 text-right">{s.current_price}</td>
              <td
                className={`px-3 py-2 text-right ${
                  parseFloat(s.change_pct) >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {s.change_pct}%
              </td>
              <td className="px-3 py-2 text-right">{s.volume}</td>
              <td className="px-3 py-2">{s.sector}</td>
              <td className="px-3 py-2 text-right">{s.high_52}</td>
              <td className="px-3 py-2 text-right">{s.low_52}</td>
              <td className="px-3 py-2 text-right">{s.market_cap}</td>
              <td className="px-3 py-2 text-right">{s.pe_ratio}</td>
              <td className="px-3 py-2 text-right">{s.eps}</td>
              <td className="px-3 py-2">{s.source}</td>
              <td className="px-3 py-2 text-center">
                <button
                  onClick={() => toggleWatchlist(s.symbol)}
                  className="text-lg"
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
