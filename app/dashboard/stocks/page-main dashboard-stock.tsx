"use client";

import Image from "next/image";
import Link from "next/link";
import LiveMarketData from "@/components/LiveMarketData";
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
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/utils/firebase";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658"];

interface FPIData {
  date: string;
  equityPurchase: number;
  equitySale: number;
  netInvestment: number;
}

interface SectorData {
  name: string;
  change: number;
}

interface Company {
  symbol: string;
  name: string;
  price: number;
  change: number;
}

export default function StocksPage() {
  const [fpiData, setFpiData] = useState<FPIData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fpiTrend, setFpiTrend] = useState<{ date: string; netInvestment: number }[]>([]);
  const [marketData, setMarketData] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sortAsc, setSortAsc] = useState(true);
  const [filter, setFilter] = useState<"all" | "positive" | "negative">("all");
  const [search, setSearch] = useState("");

  const [companies, setCompanies] = useState<Company[]>([]);

  function formatAmount(amount: number) {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} Lakh`;
    return `₹${amount.toLocaleString()}`;
  }

  useEffect(() => {
    async function fetchStoredFpi() {
      try {
        const q = query(collection(db, "fpiData"), orderBy("date", "desc"));
        const snapshot = await getDocs(q);
        const trend = snapshot.docs.map((doc) => doc.data()) as FPIData[];
        if (trend.length > 0) {
          setFpiData(trend[0]);
          setFpiTrend(trend.map((entry) => ({ date: entry.date, netInvestment: entry.netInvestment })));
        }
      } catch (err) {
        console.error("Error reading FPI data from Firestore:", err);
      }
    }

    async function fetchStoredMarket() {
      try {
        const q = query(collection(db, "marketData"), orderBy("date", "desc"));
        const snapshot = await getDocs(q);
        const entries = snapshot.docs.map((doc) => doc.data());
        if (entries.length > 0) setMarketData(entries[0]);
      } catch (err) {
        console.error("Error reading market data from Firestore:", err);
      }
    }

    async function fetchLiveCompanies() {
      try {
        const res = await fetch("/api/live-stock-data?symbols=TCS,INFY,RELIANCE,HDFC,ITC");
        const json = await res.json();
        if (json.success) {
          setCompanies(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch live stock data", err);
      }
    }

    fetchStoredFpi();
    fetchStoredMarket();
    fetchLiveCompanies();
  }, []);

  const SECTORS = [
    { name: "IT", change: 1.2 },
    { name: "Finance", change: -0.8 },
    { name: "Pharma", change: 0.4 },
    { name: "Auto", change: -1.5 },
    { name: "Energy", change: 2.1 },
    { name: "Realty", change: 0.9 },
    { name: "FMCG", change: -0.2 },
    { name: "Metals", change: 1.5 },
    { name: "Media", change: -1.1 },
    { name: "Telecom", change: 0.6 },
  ];

  const filteredSectors = SECTORS.filter((s) => {
    if (filter === "positive") return s.change >= 0;
    if (filter === "negative") return s.change < 0;
    return true;
  });

  const sortedSectors = [...filteredSectors].sort((a, b) =>
    sortAsc ? a.change - b.change : b.change - a.change
  );

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className={`$${isDarkMode ? "bg-gray-900 text-white" : "bg-white text-gray-800"} flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 md:px-12 py-12`}>
      <div className="flex flex-wrap justify-center gap-4 mb-4">
        <button
          onClick={() => setSortAsc(!sortAsc)}
          className="px-4 py-2 border rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
        >
          Sort by Change ({sortAsc ? "Asc" : "Desc"})
        </button>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="px-3 py-2 border rounded text-sm"
        >
          <option value="all">All Sectors</option>
          <option value="positive">Positive Only</option>
          <option value="negative">Negative Only</option>
        </select>
      </div>

      <div className="w-full overflow-x-auto">
        <div className="min-w-[640px] max-w-5xl mx-auto">
          <h2 className="text-lg font-semibold mb-2">📊 Sector Heatmap</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sortedSectors} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="change" fill="#82ca9d" isAnimationActive={true}>
                {sortedSectors.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.change >= 0 ? "#34D399" : "#F87171"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-12 w-full max-w-5xl">
        <h2 className="text-lg font-semibold mb-2">🔍 Search Stocks</h2>
        <input
          type="text"
          placeholder="Search by company name or symbol"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        <div className="overflow-x-auto">
          <table className="min-w-[600px] w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="text-left px-4 py-2">Symbol</th>
                <th className="text-left px-4 py-2">Company</th>
                <th className="text-left px-4 py-2">Price</th>
                <th className="text-left px-4 py-2">Change</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map((company, index) => (
                <tr
                  key={index}
                  onClick={() => window.location.href = `/dashboard/stocks/${company.symbol}`}
                  className="border-b hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <td className="px-4 py-2 font-semibold">{company.symbol}</td>
                  <td className="px-4 py-2">{company.name}</td>
                  <td className="px-4 py-2">₹{company.price}</td>
                  <td className={`px-4 py-2 ${company.change >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {company.change > 0 ? "+" : ""}{company.change}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
