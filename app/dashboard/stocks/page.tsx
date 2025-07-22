'use client';

import { useEffect, useState } from 'react';

type Stock = {
  symbol: string;
  name: string;
  price: number;
  volume: number;
  change: number;
  percentChange: number;
  sector: string;
};

export default function StocksDashboard() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchStocks() {
      const res = await fetch('/api/live-stock-data?symbols=NSE:RELIANCE,NSE:TCS,NSE:INFY,NSE:HDFCBANK');
      const json = await res.json();
      setStocks(json.data || []);
    }
    fetchStocks();
  }, []);

  const filteredStocks = stocks.filter(stock =>
    stock.name.toLowerCase().includes(search.toLowerCase()) ||
    stock.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-semibold mb-4 text-purple-700">📊 Live Stocks Dashboard</h1>

      <input
        type="text"
        placeholder="Search stock..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm border rounded px-4 py-2 mb-4"
      />

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="p-2">Symbol</th></span>
              <th className="p-2">Name</th></span>
              <th className="p-2">Price</th></span>
              <th className="p-2">Volume</th></span>
              <th className="p-2">% Change</th></span>
              <th className="p-2">Sector</th></span>
            </tr>
          </thead>
          <tbody>
            {filteredStocks.map((stock) => (
              <tr key={stock.symbol} className="border-t hover:bg-gray-100">
                <td className="p-2 font-medium">{stock.symbol}</td>
                <td className="p-2">{stock.name}</td>
                <td className="p-2">₹{stock.price.toFixed(2)}</td>
                <td className="p-2">{stock.volume.toLocaleString()}</td>
                <td className={`p-2 ${stock.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stock.percentChange.toFixed(2)}%
                </td>
                <td className="p-2">{stock.sector}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
