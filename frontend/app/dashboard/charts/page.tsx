// client-page.tsx
"use client";

import { useSearchParams } from "next/navigation";

export default function ChartClientPage() {
  const searchParams = useSearchParams();
  const symbol = searchParams.get("symbol") || "PNB";

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">📈 Chart Viewer</h1>
      <p>Rendering chart for symbol: <strong>{symbol}</strong></p>
      {/* Embed chart logic here */}
    </div>
  );
}
