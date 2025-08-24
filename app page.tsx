// FILE: app/page.tsx
"use client";
import useSWR from "swr";
import { useState, useMemo } from "react";
import TickerSearch from "@/components/TickerSearch";
import PriceBoard from "@/components/PriceBoard";
import CandleChart from "@/components/CandleChart";
import AIInsights from "@/components/AIInsights";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Page() {
  const [symbol, setSymbol] = useState("AAPL");
  const { data: qres } = useSWR(`/api/quote?symbol=${symbol}`, fetcher, { refreshInterval: 5000 });
  const { data: cres } = useSWR(`/api/candles?symbol=${symbol}&interval=5min`, fetcher, { refreshInterval: 60000 });
  const quote = qres?.data;
  const candles = useMemo(() => cres?.data || [], [cres]);

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">AI Stock App</h1>
      <TickerSearch onSelect={setSymbol} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
            <CandleChart data={candles} />
          </div>
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
            <AIInsights symbol={symbol} quote={quote} />
          </div>
        </div>
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
            <PriceBoard q={quote} />
          </div>
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
            <Watchlist symbol={symbol} onPick={setSymbol} />
          </div>
        </div>
      </div>
    </main>
  );
}

function Watchlist({ symbol, onPick }: { symbol: string; onPick: (s: string) => void }) {
  const [items, setItems] = useState<string[]>(() => {
    if (typeof window === "undefined") return ["AAPL", "MSFT", "GOOGL"];
    try { return JSON.parse(localStorage.getItem("wl") || "[\"AAPL\",\"MSFT\",\"GOOGL\"]"); } catch { return ["AAPL","MSFT","GOOGL"]; }
  });
  const [input, setInput] = useState("");
  function add() {
    const t = input.trim().toUpperCase();
    if (!t) return;
    const next = Array.from(new Set([t, ...items])).slice(0, 30);
    setItems(next); localStorage.setItem("wl", JSON.stringify(next)); setInput("");
  }
  function remove(t: string) {
    const next = items.filter((x) => x !== t); setItems(next); localStorage.setItem("wl", JSON.stringify(next));
  }
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input className="flex-1 bg-zinc-900 rounded-2xl px-3 py-2 border border-zinc-800" placeholder="Add ticker" value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=> e.key==="Enter" && add()} />
        <button onClick={add} className="px-3 py-2 rounded-2xl bg-zinc-700">Add</button>
      </div>
      <ul className="space-y-2">
        {items.map((t) => (
          <li key={t} className={`flex items-center justify-between px-3 py-2 rounded-xl border ${t===symbol?"border-indigo-500 bg-indigo-500/10":"border-zinc-800 bg-zinc-900"}`}>
            <button onClick={() => onPick(t)} className="font-medium">{t}</button>
            <button onClick={() => remove(t)} className="text-xs text-zinc-400">remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

