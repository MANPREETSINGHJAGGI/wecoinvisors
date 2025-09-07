"use client";

import { useState } from "react";

export default function TestHistorical() {
  const [symbol, setSymbol] = useState("RELIANCE.NS");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/historical-chart?symbol=${symbol}&range=1mo&interval=1d`
      );
      const json = await res.json();
      setData(json);
      console.log("✅ Historical Data:", json);
    } catch (err) {
      console.error("⚠️ Fetch error:", err);
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Historical Chart Test</h1>

      <input
        type="text"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        className="border px-2 py-1 rounded mr-2"
        placeholder="Enter symbol (e.g. TCS.NS)"
      />
      <button
        onClick={fetchData}
        className="bg-blue-600 text-white px-4 py-1 rounded"
      >
        {loading ? "Loading..." : "Fetch Data"}
      </button>

      {data && (
        <pre className="mt-4 p-2 bg-gray-100 rounded text-xs overflow-x-scroll">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
