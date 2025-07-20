// components/SectorHeatmap.tsx
const sectorData = [
  { sector: "IT", change: 1.2 },
  { sector: "Finance", change: -0.8 },
  { sector: "Pharma", change: 0.4 },
  { sector: "Auto", change: -1.5 },
  { sector: "Energy", change: 2.1 },
];

export default function SectorHeatmap() {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded border shadow-md mt-8 w-full max-w-4xl">
      <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">🔥 Sector Heatmap</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 text-sm text-center">
        {sectorData.map((item) => (
          <div
            key={item.sector}
            className={`p-3 rounded-md shadow-sm ${
              item.change >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            <div className="font-semibold">{item.sector}</div>
            <div className="text-xs">{item.change > 0 ? "+" : ""}{item.change}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
