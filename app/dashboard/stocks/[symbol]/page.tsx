"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Brush,
  Legend,
  ReferenceLine,
  BarChart,
  Bar,
} from "recharts";

interface TimeSeriesEntry {
  datetime: string;
  value: number;
  volume?: number;
  percentChange?: number;
}

const INTERVAL_OPTIONS = [
  { label: "30 sec", value: "30s" },
  { label: "1 min", value: "1min" },
  { label: "5 min", value: "5min" },
  { label: "15 min", value: "15min" },
  { label: "1 hour", value: "1h" },
  { label: "4 hours", value: "4h" },
  { label: "Daily Close", value: "1day" },
];

const SUGGESTED_SYMBOLS = ["TCS", "INFY", "RELIANCE", "HDFCBANK", "ITC"];

export default function StockSymbolPage() {
  const params = useParams();
  const router = useRouter();
  const symbol = decodeURIComponent(params.symbol as string);
  const [data, setData] = useState<TimeSeriesEntry[]>([]);
  const [interval, setInterval] = useState("1min");
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const latestPrice = data[data.length - 1]?.value || 0;
  const priceChange = data.length > 1 ? latestPrice - data[0].value : 0;
  const percentChange = data.length > 1 ? (priceChange / data[0].value) * 100 : 0;

  useEffect(() => {
    async function fetchStockData() {
      setLoading(true);
      try {
        let res = await fetch(`/api/twelve-data?symbol=${symbol}&interval=${interval}`);
        let json = await res.json();

        if (!json.success) {
          res = await fetch(`/api/alpha-vantage?symbol=${symbol}&interval=${interval}`);
          json = await res.json();
        }

        if (json.success) {
          const values = json.data.values
            .map((entry: any) => ({
              datetime: entry.datetime,
              value: parseFloat(entry.close),
              volume: parseInt(entry.volume),
            }))
            .reverse();

          const firstValue = values[0]?.value || 1;
          const withChange = values.map((entry) => ({
            ...entry,
            percentChange: ((entry.value - firstValue) / firstValue) * 100,
          }));

          setData(withChange);
        }
      } catch (err) {
        console.error("Failed to fetch time series data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStockData();
  }, [symbol, interval]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/dashboard/stocks/${searchInput.toUpperCase()}`);
      setSearchInput("");
    }
  };

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <form onSubmit={handleSearchSubmit} className="mb-4">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search company symbol (e.g., TCS)"
          className="border p-2 rounded mr-2"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Search
        </button>
      </form>

      <h1 className="text-2xl font-bold mb-4">
        📊 {symbol} - {interval === "1day" ? "Daily Trend" : "Intraday Price Chart"}
      </h1>

      <div className="bg-gray-100 p-4 rounded mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Current Price</h2>
          <p className="text-2xl font-bold text-blue-600">₹{latestPrice.toFixed(2)}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Change</h2>
          <p className={`text-xl font-semibold ${priceChange >= 0 ? "text-green-600" : "text-red-600"}`}>
            {priceChange >= 0 ? "+" : ""}{priceChange.toFixed(2)} ({percentChange.toFixed(2)}%)
          </p>
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="interval" className="mr-2 font-semibold">Select Interval:</label>
        <select
          id="interval"
          value={interval}
          onChange={(e) => setInterval(e.target.value)}
          className="p-2 border rounded"
        >
          {INTERVAL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading data...</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="datetime"
              tickFormatter={(tick) =>
                interval === "1day" ? tick.split(" ")[0] : tick.split(" ")[1]
              }
            />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip formatter={(value: any, name: string) => [value.toFixed(2), name]} />
            <Legend />
            <Brush dataKey="datetime" height={30} stroke="#8884d8" />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#8884d8"
              strokeWidth={2}
              dot={false}
              name="Price"
            />
            <Line
              type="monotone"
              dataKey="percentChange"
              stroke="#82ca9d"
              strokeWidth={1.5}
              dot={false}
              name="% Change"
              yAxisId={1}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {data.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Volume Chart</h3>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="datetime" hide />
              <YAxis hide />
              <Tooltip formatter={(value: any) => [value, "Volume"]} />
              <Bar dataKey="volume" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </main>
  );
}
