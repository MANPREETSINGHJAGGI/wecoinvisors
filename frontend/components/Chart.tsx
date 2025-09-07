"use client";

import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartProps {
  symbol: string; // Stock symbol (e.g., TCS.NS)
  interval?: string; // Interval like 1d, 1wk, 1mo
  range?: string; // Range like 1mo, 6mo, 1y
}

interface HistoricalDataPoint {
  date: string;
  close: number;
}

export default function Chart({ symbol, interval = "1d", range = "1mo" }: ChartProps) {
  const [data, setData] = useState<HistoricalDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistoricalData = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/historical-chart?symbol=${symbol}&interval=${interval}&range=${range}`
      );
      if (!res.ok) throw new Error("Failed to fetch historical data");
      const json = await res.json();
      setData(json?.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoricalData();
  }, [symbol, interval, range]);

  if (loading) {
    return (
      <div className="text-center py-6">
        <span className="text-gray-500">Loading chart...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6 text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-xl shadow-md p-4">
      <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-100">
        {symbol} Historical Chart
      </h2>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={["auto", "auto"]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="close"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-center text-gray-500">No data available</p>
      )}
    </div>
  );
}
