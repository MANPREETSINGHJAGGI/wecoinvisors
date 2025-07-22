// app/page.tsx
"use client";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center py-24 px-6 text-center bg-gradient-to-r from-blue-100 to-purple-100">
        <h1 className="text-5xl font-bold mb-4 text-blue-900">
          <span className="text-purple-700">WeCoinvisors</span> 🚀
        </h1>
        <p className="text-xl max-w-2xl mb-8">
          WeCoinVisors Leads Cohart of People With Stock & Education
        </p>
        <a
          href="/dashboard/stocks"
          className="px-6 py-3 bg-purple-600 text-white rounded shadow hover:bg-purple-700 transition"
        >
          Explore Dashboard
        </a>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">What We Offer</h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="bg-white p-6 rounded shadow hover:shadow-md">
            <h3 className="text-xl font-semibold text-purple-700">Live Stock Dashboard</h3>
            <p className="text-gray-600 mt-2">Real-time market insights and stock data for informed decisions.</p>
          </div>
          <div className="bg-white p-6 rounded shadow hover:shadow-md">
            <h3 className="text-xl font-semibold text-purple-700">Education Resources</h3>
            <p className="text-gray-600 mt-2">Learn finance and stock market from basics to advanced.</p>
          </div>
          <div className="bg-white p-6 rounded shadow hover:shadow-md">
            <h3 className="text-xl font-semibold text-purple-700">Student Doubt Solver</h3>
            <p className="text-gray-600 mt-2">Ask questions and get answers via our intelligent bots like Zed.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 text-center py-6 text-sm text-gray-600">
        © {new Date().getFullYear()} WeCoinvisors. All rights reserved.
      </footer>
    </main>
  );
}
