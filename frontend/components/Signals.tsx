"use client";

import React, { useEffect, useState } from "react";
import { Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface SignalProps {
  symbol: string; // Stock symbol, e.g., RELIANCE.NS
}

interface SignalData {
  rsi: number;
  movingAvg: string;
  recommendation: "BUY" | "SELL" | "HOLD";
}

export default function Signals({ symbol }: SignalProps) {
  const [signals, setSignals] = useState<SignalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSignals = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/signals?symbol=${symbol}`);
      if (!res.ok) throw new Error("Failed to fetch signals");
      const json = await res.json();
      setSignals(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignals();
  }, [symbol]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-6">
        <Loader2 className="animate-spin text-blue-500" size={24} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-500 font-semibold">
        {error}
      </div>
    );
  }

  if (!signals) {
    return (
      <div className="text-center text-gray-500 py-4">No signals available</div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 mt-4">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
        Trading Signals for {symbol}
      </h2>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="p-3 border rounded-lg dark:border-gray-700">
          <p className="text-gray-500 text-sm">RSI</p>
          <p className="text-lg font-bold">{signals.rsi}</p>
        </div>

        <div className="p-3 border rounded-lg dark:border-gray-700">
          <p className="text-gray-500 text-sm">Moving Avg</p>
          <p className="text-lg font-bold">{signals.movingAvg}</p>
        </div>

        <div
          className={`p-3 border rounded-lg dark:border-gray-700 flex flex-col items-center ${
            signals.recommendation === "BUY"
              ? "bg-green-100 text-green-600"
              : signals.recommendation === "SELL"
              ? "bg-red-100 text-red-600"
              : "bg-yellow-100 text-yellow-600"
          }`}
        >
          <p className="text-sm">Recommendation</p>
          {signals.recommendation === "BUY" && (
            <TrendingUp size={22} className="mt-1" />
          )}
          {signals.recommendation === "SELL" && (
            <TrendingDown size={22} className="mt-1" />
          )}
          {signals.recommendation === "HOLD" && (
            <Minus size={22} className="mt-1" />
          )}
          <p className="text-lg font-bold">{signals.recommendation}</p>
        </div>
      </div>
    </div>
  );
}
