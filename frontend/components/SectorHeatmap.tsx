"use client";

import { useEffect, useState } from "react";

type HeatmapItem = {
  sector: string;
  avgChange: number;
};

export default function SectorHeatmap() {
  const [heatmap, setHeatmap] = useState<HeatmapItem[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/sector-heatmap")
      .then((res) => res.json())
      .then((data) => setHeatmap(data.data));
  }, []);

  const getColor = (change: number) => {
    if (change > 2) return "bg-green-500";
    if (change > 0) return "bg-yellow-300";
    return "bg-red-400";
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">📊 Sector Heatmap</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {heatmap.map((sector) => (
          <div
            key={sector.sector}
            className={`p-4 rounded shadow text-white text-center ${getColor(
              sector.avgChange
            )}`}
          >
            <div className="text-lg font-semibold">{sector.sector}</div>
            <div className="text-sm">{sector.avgChange}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
