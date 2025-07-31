"use client";

import Image from "next/image";
import Link from "next/link";
import LiveMarketData from "@/components/LiveMarketData";
import ProtectedRoute from "@/components/ProtectedRoute"; // ✅ Authentication wrapper
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658"];

function StocksContent() {
  const [fpiData, setFpiData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [fpiTrend, setFpiTrend] = useState<any[]>([]);
  const [marketData, setMarketData] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  function formatAmount(amount: number) {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} Lakh`;
    return `₹${amount.toLocaleString()}`;
  }

  useEffect(() => {
    async function fetchFpi() {
      try {
        const res = await fetch("/api/fpi?provider=dual");
        const json = await res.json();
        if (json.data) {
          setFpiData(json.data);
          setFpiTrend(json.trend || []);

          // Store in Firestore (Optional)
          await fetch("/api/store-fpi", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(json.data),
          });
        } else {
          throw new Error(json.error);
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch FPI data.");
      }
    }

    async function fetchMarket() {
      try {
        const res = await fetch("/api/market?provider=dual");
        const json = await res.json();
        if (json.nifty && json.sensex) {
          setMarketData(json);

          await fetch("/api/store-market", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(json),
          });
        }
      } catch (err) {
        console.error("Failed to fetch market data.", err);
      }
    }

    fetchFpi();
    fetchMarket();
    const interval = setInterval(() => {
      fetchFpi();
      fetchMarket();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const pieData = fpiData
    ? [
        { name: "Equity Purchase", value: fpiData.equityPurchase },
        { name: "Equity Sale", value: fpiData.equitySale },
        { name: "Net Investment", value: fpiData.netInvestment },
      ]
    : [];

  const isPositive = (value: number) => value >= 0;

  return (
    <main
      className={`${
        isDarkMode ? "bg-gray-900 text-white" : "bg-white text-gray-800"
      } flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 md:px-12 py-12`}
    >
      {/* 🌙 Dark Mode Toggle */}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="absolute top-4 right-4 px-3 py-1 text-sm border rounded hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        Toggle {isDarkMode ? "Light" : "Dark"} Mode
      </button>

      <h1 className="text-3xl font-bold text-green-700 mb-6">
        📈 Stock Market Insights
      </h1>
      <p className="text-center text-gray-600 dark:text-gray-300 max-w-2xl mb-10">
        Explore market data, trends, and investment strategies curated for you.
      </p>

      {/* Live Market Data Section */}
      <div className="bg-green-100 dark:bg-green-900 p-6 rounded-lg shadow-md hover:shadow-lg transition w-full max-w-4xl mb-8">
        <h2 className="text-xl font-semibold text-green-800 dark:text-green-300 mb-2">
          Live Market Data
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Stay updated with real-time stock prices, charts, and FPI investment trends.
        </p>
        <LiveMarketData provider="dual" />

        {/* Nifty/Sensex Display */}
        {marketData && (
          <div className="grid grid-cols-2 gap-4 mt-4 text-center">
            <div className="bg-white dark:bg-gray-800 p-4 rounded border">
              <h4 className="text-green-700 dark:text-green-300 font-semibold">
                Nifty
              </h4>
              <p className="text-xl">{marketData.nifty}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded border">
              <h4 className="text-green-700 dark:text-green-300 font-semibold">
                Sensex
              </h4>
              <p className="text-xl">{marketData.sensex}</p>
            </div>
          </div>
        )}

        {/* FPI Section */}
        <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded border">
          <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-2">
            📊 FPI Data (Foreign Portfolio Investment)
          </h3>
          {fpiData ? (
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 mb-4">
              <li>
                <strong>Date:</strong> {fpiData.date}
              </li>
              <li>
                <strong>Equity Purchase:</strong>{" "}
                {formatAmount(fpiData.equityPurchase)}
              </li>
              <li>
                <strong>Equity Sale:</strong>{" "}
                {formatAmount(fpiData.equitySale)}
              </li>
              <li>
                <strong>Net Investment:</strong>{" "}
                <span
                  className={`font-semibold ${
                    isPositive(fpiData.netInvestment)
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatAmount(fpiData.netInvestment)}
                </span>
              </li>
            </ul>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : (
            <p className="text-gray-500 italic">Loading FPI data...</p>
          )}

          {/* Line Chart */}
          {fpiTrend.length > 0 && (
            <ResponsiveContainer width="100%" height={300} className="mb-6">
              <LineChart
                data={fpiTrend}
                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
              >
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="netInvestment"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          )}

          {/* Pie Chart */}
          {pieData.length > 0 && (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Investment Tips Section */}
      <div className="bg-yellow-100 dark:bg-yellow-900 p-6 rounded-lg shadow-md hover:shadow-lg transition w-full max-w-4xl">
        <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
          Investment Tips
        </h2>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-200 space-y-2">
          <li>Invest for the long term to build stable returns.</li>
          <li>Diversify your portfolio to manage risk.</li>
          <li>Use only verified and government-sourced data.</li>
          <li>Track your investments regularly.</li>
        </ul>
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/"
          className="text-blue-600 dark:text-blue-300 hover:underline text-sm"
        >
          ← Back to Homepage
        </Link>
      </div>
    </main>
  );
}

export default function StocksPage() {
  return (
    <ProtectedRoute>
      <StocksContent />
    </ProtectedRoute>
  );
}
