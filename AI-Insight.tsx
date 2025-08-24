// FILE: components/AIInsights.tsx
"use client";
import useSWR from "swr";
import { useState } from "react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AIInsights({ symbol, quote }: { symbol: string; quote: any }) {
  const { data: news } = useSWR(`/api/news?symbol=${symbol}`, fetcher, { refreshInterval: 300000 });
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try {
      const r = await fetch("/api/ai-analyze", { method: "POST", body: JSON.stringify({ symbol, quote, news: news?.data }) });
      const j = await r.json();
      setText(j.data || j.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-zinc-400">AI Insights</div>
        <button onClick={run} disabled={loading} className="px-3 py-1.5 rounded-xl bg-indigo-600 disabled:opacity-60">{loading ? "Analyzing…" : "Analyze"}</button>
      </div>
      <textarea className="w-full h-48 bg-zinc-900 rounded-2xl p-3 border border-zinc-800" value={text} readOnly />
      <div className="text-xs text-zinc-500">AI is experimental and not financial advice.</div>
    </div>
  );
}
