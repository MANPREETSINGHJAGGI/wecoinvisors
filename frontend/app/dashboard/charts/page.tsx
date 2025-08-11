// frontend/app/(main)/dashboard/charts/page.tsx
"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
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

interface Stock {
  symbol: string;
  name: string;
  price: number;
  percentChange: number;
  volume: number;
  sector: string;
  marketCap: number;
  peRatio: number;
  eps: number;
  isGolden?: boolean;
}

const SYMBOLS = ["AAPL", "MSFT", "TSLA", "GOOGL", "META", "TCS.NS"];
const RANGES = ["1D", "3D", "5D", "1M", "3M", "6M", "1Y", "2Y", "3Y", "4Y", "5Y"];

function ChartContent() {
  const searchParams = useSearchParams();
  const initialSymbol = searchParams.get("symbol") || "AAPL";

  const [symbol, setSymbol] = useState(initialSymbol);
  const [range, setRange] = useState("1M");
  const [data, setData] = useState<any>(null);
  const [stockInfo, setStockInfo] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

  // Fetch chart data and stock info
  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      try {
        const chartRes = await fetch(
          `${baseUrl}/api/historical-chart?symbol=${symbol}&range=${range}`
        );
        const chartJson = await chartRes.json();
        setData(chartJson);

        const stockRes = await fetch(
          `${baseUrl}/api/live-stock-data?symbols=${symbol}&highlight=${symbol}`
        );
        const stockJson = await stockRes.json();
        if (Array.isArray(stockJson) && stockJson.length > 0) {
          setStockInfo(stockJson[0]);
        }
      } catch (err) {
        console.error("Error fetching chart or stock:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [symbol, range]);

  // Export as PNG
  const downloadPNG = async () => {
    if (!chartRef.current) return;
    const canvas = await html2canvas(chartRef.current);
    const link = document.createElement("a");
    link.download = `${symbol}_${range}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  // Export as CSV
  const downloadCSV = () => {
    if (!data) return;
    const rows = [["Date", "Price"], ...data.labels.map((l: string, i: number) => [l, data.prices[i]])];
    const csvContent = rows.map((r) => r.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${symbol}_${range}.csv`;
    link.click();
  };

  const priceColor =
    stockInfo?.percentChange! > 0
      ? "text-green-400"
      : stockInfo?.percentChange! < 0
      ? "text-red-400"
      : "text-gray-400";

  const cardClass = stockInfo?.isGolden
    ? "border-2 border-yellow-500 shadow-yellow-500/50 shadow-lg"
    : "border border-gray-700";

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

      <div ref={chartRef} className={`bg-dark p-4 rounded-lg shadow-md ${cardClass}`}>
        {stockInfo && (
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gold">{stockInfo.symbol}</h2>
            <p className="text-gray-300">
              Price: {stockInfo.price.toFixed(2)} |{" "}
              <span className={priceColor}>{stockInfo.percentChange.toFixed(2)}%</span>
            </p>
          </div>
        )}

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
                x: { ticks: { color: "#b0b0b0" } },
                y: { ticks: { color: "#b0b0b0" } },
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

// ✅ Wrap with Suspense to handle useSearchParams
export default function ChartPageWrapper() {
  return (
    <Suspense fallback={<div className="p-6 text-white">Loading Chart Viewer...</div>}>
      <ChartContent />
    </Suspense>
  );
}
