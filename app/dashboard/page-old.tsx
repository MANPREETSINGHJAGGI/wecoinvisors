// app/dashboard/page.tsx
"use client";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard 🧭</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Link href="/education">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg cursor-pointer transition">
            <h2 className="text-2xl font-semibold text-blue-700 mb-2">Education Platform</h2>
            <p className="text-gray-600">Learning modules and student support resources.</p>
          </div>
        </Link>
        <Link href="/market">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg cursor-pointer transition">
            <h2 className="text-2xl font-semibold text-green-700 mb-2">Stock Market Insights</h2>
            <p className="text-gray-600">Market analysis, charts, and financial tools.</p>
          </div>
        </Link>
      </div>
    </main>
  );
}
<div className="mt-12 text-center">
  <Link
    href="/"
    className="text-blue-600 hover:underline text-sm"
  >
    ← Back to Homepage
  </Link>
</div>
