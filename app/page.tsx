// app/page.tsx
"use client";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center py-24 px-6 text-center bg-gradient-to-r from-blue-100 to-purple-100">
        <h1 className="text-5xl font-bold mb-4 text-blue-900">
          Welcome to <span className="text-purple-700">WeCoinvisors</span> 🚀
        </h1>
        <p className="text-xl max-w-2xl mb-8">
           WeCoinVisors Leads Cohart of People With Stock & Education 🚀
        </p>
        <a
          href="/dashboard/stocks"
          className="px-6 py-3 bg-purple-600 text-white rounded shadow hover:bg-purple-700 transition"
        >
          Explore Dashboard
        </a>
      </section>
    </main>
  );
}
