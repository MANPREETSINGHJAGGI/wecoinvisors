// FILE: components/PriceBoard.tsx
"use client";
export default function PriceBoard({ q }: { q: any }) {
  const pct = q?.changePercent || 0;
  const dir = pct >= 0 ? "text-emerald-400" : "text-rose-400";
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
        <div className="text-zinc-400 text-sm">Price</div>
        <div className="text-2xl font-semibold">{q?.price?.toFixed?.(2)}</div>
      </div>
      <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
        <div className="text-zinc-400 text-sm">Change</div>
        <div className={`text-2xl font-semibold ${dir}`}>{q?.change?.toFixed?.(2)} ({pct.toFixed?.(2)}%)</div>
      </div>
      <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
        <div className="text-zinc-400 text-sm">Volume</div>
        <div className="text-2xl font-semibold">{q?.volume?.toLocaleString?.()}</div>
      </div>
      <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
        <div className="text-zinc-400 text-sm">Symbol</div>
        <div className="text-2xl font-semibold">{q?.symbol}</div>
      </div>
    </div>
  );
}

