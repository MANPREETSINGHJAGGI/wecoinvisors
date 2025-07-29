// frontend/app/dashboard/charts/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import html2canvas from "html2canvas";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

const SYMBOLS = ["AAPL", "MSFT", "TSLA", "GOOGL", "META"];
const RANGES = ["1D", "3D", "5D", "1M", "3M", "6M", "1Y", "2Y", "3Y", "4Y", "5Y"];

export default function ChartPage() {
  const searchParams = useSearchParams();
  const initialSymbol = searchParams.get("symbol") || "AAPL";

  const [symbol, setSymbol] = useState(initialSymbol);
  const [range, setRange] = useState("1M");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const chartRef = useRef(null);

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
        const res = await fetch(`${baseUrl}/api/historical-chart?symbol=${symbol}&range=${range}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Error fetching chart:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [symbol, range]);

  const downloadPNG = async () => {
    if (!chartRef.current) return;
    const canvas = await html2canvas(chartRef.current);
    const link = document.createElement("a");
    link.download = `${symbol}_${range}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const downloadCSV = () => {
    if (!data) return;
    const rows = [["Date", "Price"], ...data.labels.map((label: string, i: number) => [label, data.prices[i]])];
    const csvContent = rows.map((r) => r.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${symbol}_${range}.csv`;
    link.click();
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4 text-gold">📈 Chart Viewer</h1>

      <div className="flex gap-4 mb-4">
        <select
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="bg-dark border border-gold px-3 py-1 rounded"
        >
          {SYMBOLS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="bg-dark border border-gold px-3 py-1 rounded"
        >
          {RANGES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <button onClick={downloadPNG} className="bg-gold text-black px-3 py-1 rounded shadow-gold">
          Export PNG
        </button>
        <button onClick={downloadCSV} className="bg-gold text-black px-3 py-1 rounded shadow-gold">
          Export CSV
        </button>
      </div>

      <div ref={chartRef} className="bg-dark p-4 rounded-lg border border-gold shadow-md">
        {loading ? (
          <p className="text-grayText">Loading chart...</p>
        ) : data && data.labels ? (
          <Line
            data={{
              labels: data.labels,
              datasets: [
                {
                  label: `${symbol} Price`,
                  data: data.prices,
                  borderColor: "#FFD700",
                  backgroundColor: "rgba(255, 215, 0, 0.2)",
                  fill: true,
                  tension: 0.3,
                },
              ],
            }}
            options={{
              responsive: true,
              scales: {
                x: {
                  ticks: { color: "#b0b0b0" },
                },
                y: {
                  ticks: { color: "#b0b0b0" },
                },
              },
            }}
          />
        ) : (
          <p className="text-red-500">No chart data found</p>
        )}
      </div>
    </div>
  );
}
