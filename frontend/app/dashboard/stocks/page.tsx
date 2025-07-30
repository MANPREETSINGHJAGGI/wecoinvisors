'use client';

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import StockTable from "@/components/StockTable";
import StockFilters from "@/components/StockFilters";
import SectorHeatmap from "@/components/SectorHeatmap";

type Stock = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  percentChange: number;
  volume: number;
  sector: string;
};

export default function StocksPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [sectors, setSectors] = useState<string[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading]);

  useEffect(() => {
    const fetchStocks = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/live-stock-data");
        const data = await res.json();
        setStocks(data);
        setFilteredStocks(data);

        const uniqueSectors = [...new Set(data.map((s: Stock) => s.sector))].sort();
        setSectors(uniqueSectors);
      } catch (err) {
        console.error("Error fetching stock data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchStocks();
    }
  }, [user]);

  const handleFilter = (selectedSector: string) => {
    if (selectedSector === "All") {
      setFilteredStocks(stocks);
    } else {
      const filtered = stocks.filter(stock => stock.sector === selectedSector);
      setFilteredStocks(filtered);
    }
  };

  if (loading || !user) return <p>Loading session...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📊 Live Stocks Dashboard</h1>
      <SectorHeatmap />
      <StockFilters onFilter={handleFilter} sectors={["All", ...sectors]} />
      <StockTable
        stocks={filteredStocks}
        loading={isLoading}
        watchlist={watchlist}
        setWatchlist={setWatchlist}
      />
    </div>
  );
}
