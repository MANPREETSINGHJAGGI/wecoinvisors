'use client';

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import StockTable from "@/components/StockTable";
import StockFilters from "@/components/StockFilters";
import SectorHeatmap from "@/components/SectorHeatmap";

export default function StocksPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // ✅ Redirect unauthenticated users
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading]);

  if (loading || !user) return <p>Loading session...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📊 Live Stocks Dashboard</h1>
      <SectorHeatmap />
      <StockFilters onFilter={() => {}} sectors={[]} />
      <StockTable stocks={[]} loading={false} watchlist={[]} setWatchlist={() => {}} />
    </div>
  );
}
