"use client";

import { useState } from "react";

export default function StockSearch() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<any>(null);

  async function searchStock() {
    const res = await fetch(`/api/stock?symbol=${query}`);
    const json = await res.json();
    setResult(json.data);
  }

  return (
    <div className="mt-6 w-full max-w-md mx-auto">
      <input
        type="text"
        placeholder="Enter Stock Symbol (e.g., TCS.BSE)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="p-2 border w-full rounded"
      />
      <button
        onClick={searchStock}
        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Search
      </button>

      {result && (
        <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded shadow">
          <h3 className="text-lg font-semibold">{result.name}</h3>
          <p>Price: ₹{result.price}</p>
          <p>Change: {result.change}%</p>
        </div>
      )}
    </div>
  );
}
