// FILE: components/CandleChart.tsx
"use client";
import { createChart, ISeriesApi, Time } from "lightweight-charts";
import { useEffect, useRef } from "react";

export default function CandleChart({ data }: { data: any[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const chart = createChart(ref.current, { height: 420, layout: { background: { color: "#0a0a0a" }, textColor: "#d4d4d8" }, grid: { vertLines: { color: "#18181b" }, horzLines: { color: "#18181b" } } });
    const series: ISeriesApi<"Candlestick"> = chart.addCandlestickSeries({ upColor: "#22c55e", downColor: "#ef4444", borderVisible: false, wickUpColor: "#22c55e", wickDownColor: "#ef4444" });
    series.setData((data || []).map((d) => ({ time: d.time as Time, open: d.open, high: d.high, low: d.low, close: d.close })));
    const ro = new ResizeObserver(() => chart.applyOptions({ width: ref.current!.clientWidth }));
    ro.observe(ref.current);
    return () => { ro.disconnect(); chart.remove(); };
  }, [JSON.stringify(data?.slice?.(-200))]); // why: keep updates cheap
  return <div ref={ref} className="w-full" />;
}
