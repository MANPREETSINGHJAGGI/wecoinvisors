"use client";

import { useEffect, useState } from "react";

export default function LiveMarketData() {
  const [nifty, setNifty] = useState("22,000");
  const [sensex, setSensex] = useState("72,000");

  const [fpiData, setFpiData] = useState<{
    date: string;
    equityPurchase: number;
    equitySale: number;
    netInvestment: number;
  } | null>(null);

  useEffect(() => {
    async function fetchFPI() {
      try {
        const res = await fetch("/api/fpi");
        const json = await res.json();
        if (json.success) {
          setFpiData(json.data);
        }
      } catch (err) {
        console.error("Error fetching FPI data:", err);
      }
    }

    fetchFPI();
  }, []);

  return (
    <div className="space-y-6">
      {/* Nifty & Sensex */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
        <div className="bg-white rounded p-4 border">
          <h3 className="font-semibold text-green-700">Nifty</h3>
          <p className="text-xl text-gray-800">{nifty}</p>
        </div>
        <div className="bg-white rounded p-4 border">
          <h3 className="font-semibold text-green-700">Sensex</h3>
          <p className="text-xl text-gray-800">{sensex}</p>
        </div>
      </div>

      {/* FPI Investment Data */}
      {fpiData ? (
        <div className="bg-white p-4 rounded border text-sm">
          <h4 className="text-green-800 font-semibold mb-2">
            🏦 FPI Activity (as of {fpiData.date})
          </h4>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>Equity Purchase: ₹{fpiData.equityPurchase.toLocaleString()}</li>
            <li>Equity Sale: ₹{fpiData.equitySale.toLocaleString()}</li>
            <li>
              Net Investment:{" "}
              <span className={fpiData.netInvestment >= 0 ? "text-green-700" : "text-red-600"}>
                ₹{fpiData.netInvestment.toLocaleString()}
              </span>
            </li>
          </ul>
        </div>
      ) : (
        <p className="text-gray-500 text-sm">Loading FPI data...</p>
      )}
    </div>
  );
}
