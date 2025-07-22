"use client";

import { useEffect, useState } from "react";

export default function StocksDashboardPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchCompanies() {
      try {
        let url = "/api/live-stock-data";

        if (search.trim()) {
          url += `?symbols=${search.trim().toUpperCase()}`;
        } else {
          url += `?top=75`;
        }

        const res = await fetch(url);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setCompanies(json.data);
        } else {
          setCompanies([]);
        }
      } catch (err) {
        console.error("Error fetching companies", err);
        setCompanies([]);
      }
    }

    const timeout = setTimeout(fetchCompanies, 500);
    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📈 Stock Market Dashboard</h1>

      <input
        type="text"
        placeholder="Search by name or symbol"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 rounded mb-4 w-full"
      />

      <table className="w-full border text-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-2">Symbol</th>
            <th className="p-2">Company</th>
            <th className="p-2">Price</th>
            <th className="p-2">Change</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company, idx) => (
            <tr key={idx} className="border-t">
              <td className="p-2">{company.symbol}</td>
              <td className="p-2">{company.name}</td>
              <td className="p-2">₹{company.price}</td>
              <td className={`p-2 ${company.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                {company.change} ({company.percentChange}%)
              </td>
            </tr>
          ))}

          {companies.length === 0 && (
            <tr>
              <td colSpan={4} className="p-4 text-center text-gray-500">
                No stock data found. Either the symbol is incorrect or the data provider has rate-limited the request.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
