// FILE: components/TickerSearch.tsx
"use client";
import { useState } from "react";
import { Search } from "lucide-react";

export default function TickerSearch({ onSelect }: { onSelect: (s: string) => void }) {
  const [v, setV] = useState("AAPL");
  return (
    <div className="flex gap-2 items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
        <input
          className="w-full bg-zinc-900 rounded-2xl pl-9 pr-4 py-2 outline-none border border-zinc-800"
          placeholder="Search ticker (AAPL, MSFT, RELIANCE.NS)"
          value={v}
          onChange={(e) => setV(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && onSelect(v)}
        />
      </div>
      <button className="px-4 py-2 rounded-2xl bg-indigo-600" onClick={() => onSelect(v)}>Load</button>
    </div>
  );
}
