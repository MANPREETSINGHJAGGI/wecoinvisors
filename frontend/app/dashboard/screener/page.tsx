"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface Stock {
  symbol: string;
  name: string;
  price: number;
  percent_change: number;
  volume: number;
  sector: string;
}

export default function ScreenerPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortKey, setSortKey] = useState<"price" | "percent_change" | "volume" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const res = await fetch("/api/live-stock-data?provider=backend");
        const data = await res.json();
        setStocks(data.stocks || []);
        setFilteredStocks(data.stocks || []);
      } catch (error) {
        console.error("Error fetching stock data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStocks();
  }, []);

  useEffect(() => {
    let filtered = [...stocks];

    if (search) {
      filtered = filtered.filter(
        (stock) =>
          stock.name.toLowerCase().includes(search.toLowerCase()) ||
          stock.symbol.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sector !== "all") {
      filtered = filtered.filter((stock) => stock.sector === sector);
    }

    if (minPrice) {
      filtered = filtered.filter((stock) => stock.price >= parseFloat(minPrice));
    }

    if (maxPrice) {
      filtered = filtered.filter((stock) => stock.price <= parseFloat(maxPrice));
    }

    if (sortKey) {
      filtered.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        return sortOrder === "asc" ? valA - valB : valB - valA;
      });
    }

    setFilteredStocks(filtered);
  }, [search, sector, minPrice, maxPrice, sortKey, sortOrder, stocks]);

  const sectors = Array.from(new Set(stocks.map((stock) => stock.sector))).filter(Boolean);

  const handleSort = (key: "price" | "percent_change" | "volume") => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Stock Screener</h1>

      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-lg font-medium">Filters</h2>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search by name or symbol"
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
          <Input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-center text-gray-500">Loading stocks...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 text-sm">
            <thead>
              <tr className="bg-gray-100">
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
                  % Change {sortKey === "percent_change" && (sortOrder === "asc" ? "↑" : "↓")}
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
                    <td className="p-2">{stock.symbol}</td>
                    <td className="p-2">{stock.name}</td>
                    <td className="p-2">₹{stock.price.toFixed(2)}</td>
                    <td
                      className={`p-2 ${stock.percent_change >= 0 ? "text-green-600" : "text-red-600"}`}
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
      )}
    </div>
  );
}
