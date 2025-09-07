"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Stock {
  symbol: string;
  name: string;
  price: number;
  percent_change: number;
  volume: number;
  sector: string;
}

interface ScreenerProps {
  stocks: Stock[];
}

export default function Screener({ stocks }: ScreenerProps) {
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("all");
  const [sortKey, setSortKey] = useState<"price" | "percent_change" | "volume" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    let data = [...stocks];

    if (search) {
      data = data.filter(
        (stock) =>
          stock.name.toLowerCase().includes(search.toLowerCase()) ||
          stock.symbol.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sector !== "all") {
      data = data.filter((stock) => stock.sector === sector);
    }

    if (sortKey) {
      data.sort((a, b) => {
        const valA = a[sortKey] || 0;
        const valB = b[sortKey] || 0;
        return sortOrder === "asc" ? valA - valB : valB - valA;
      });
    }

    setFilteredStocks(data);
  }, [search, sector, sortKey, sortOrder, stocks]);

  const sectors = Array.from(new Set(stocks.map((s) => s.sector))).filter(Boolean);

  const handleSort = (key: "price" | "percent_change" | "volume") => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return (
    <div className="w-full">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Input
          placeholder="Search stock name or symbol"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select onValueChange={setSector} value={sector}>
          <SelectTrigger>
            <SelectValue placeholder="Select Sector" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sectors</SelectItem>
            {sectors.map((sec) => (
              <SelectItem key={sec} value={sec}>
                {sec}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-2 text-left">Symbol</th>
              <th className="p-2 text-left">Name</th>
              <th
                className="p-2 cursor-pointer"
                onClick={() => handleSort("price")}
              >
                Price {sortKey === "price" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="p-2 cursor-pointer"
                onClick={() => handleSort("percent_change")}
              >
                % Change{" "}
                {sortKey === "percent_change" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="p-2 cursor-pointer"
                onClick={() => handleSort("volume")}
              >
                Volume {sortKey === "volume" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th className="p-2">Sector</th>
            </tr>
          </thead>
          <tbody>
            {filteredStocks.length > 0 ? (
              filteredStocks.map((stock) => (
                <tr key={stock.symbol} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-medium">{stock.symbol}</td>
                  <td className="p-2">{stock.name}</td>
                  <td className="p-2">₹{stock.price.toFixed(2)}</td>
                  <td
                    className={`p-2 font-semibold ${
                      stock.percent_change >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stock.percent_change.toFixed(2)}%
                  </td>
                  <td className="p-2">{stock.volume.toLocaleString()}</td>
                  <td className="p-2">{stock.sector || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  No matching stocks found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
