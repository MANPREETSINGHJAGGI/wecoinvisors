"use client";

import { useState } from "react";

export default function Home() {
  const [symbols, setSymbols] = useState("");
  const [mode, setMode] = useState<"default" | "custom">("default");

  const handleExplore = () => {
    const base = "/dashboard/stocks";
    if (mode === "custom" && symbols.trim()) {
      window.location.href = `${base}?symbols=${encodeURIComponent(symbols)}`;
    } else {
      window.location.href = base;
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center py-24 px-6 text-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
        <h1 className="text-6xl font-extrabold mb-4 drop-shadow-lg">
          <span className="text-yellow-300">WeCoinvisors</span> 🚀
        </h1>
        <p className="text-2xl max-w-2xl mb-8 opacity-90">
          Leading a Cohort of People in Stocks & Education — Live, Interactive, AI-powered 🚀
        </p>

        {/* Mode selection */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={() => setMode("default")}
            className={`px-5 py-2 rounded font-semibold shadow-md transition ${
              mode === "default"
                ? "bg-yellow-300 text-gray-900"
                : "bg-white text-gray-900 hover:bg-gray-200"
            }`}
          >
            📊 Default List
          </button>
          <button
            onClick={() => setMode("custom")}
            className={`px-5 py-2 rounded font-semibold shadow-md transition ${
              mode === "custom"
                ? "bg-yellow-300 text-gray-900"
                : "bg-white text-gray-900 hover:bg-gray-200"
            }`}
          >
            ✏️ Custom Symbols
          </button>
        </div>

        {/* Input for custom mode */}
        {mode === "custom" && (
          <input
            type="text"
            placeholder="Enter symbols e.g. AAPL,MSFT,TSLA"
            value={symbols}
            onChange={(e) => setSymbols(e.target.value)}
            className="px-4 py-2 rounded text-gray-900 w-80 shadow-inner border border-gray-300"
          />
        )}

        {/* Explore button */}
        <button
          onClick={handleExplore}
          className="mt-6 px-8 py-3 bg-yellow-400 text-gray-900 font-bold rounded-lg shadow-lg hover:bg-yellow-500 transition"
        >
          Explore Dashboard
        </button>
      </section>

      {/* 📦 Features Grid */}
      <section className="py-16 px-6 bg-white text-center">
        <h2 className="text-3xl font-semibold mb-12 text-gray-800">Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="p-6 bg-gray-100 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-xl font-bold text-purple-600 mb-2">Live Stock Data</h3>
            <p className="text-gray-700">Track real-time stock movements from the NSE market.</p>
          </div>
          <div className="p-6 bg-gray-100 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-xl font-bold text-purple-600 mb-2">Educational Resources</h3>
            <p className="text-gray-700">Learn stock market concepts through interactive lessons and guides.</p>
          </div>
          <div className="p-6 bg-gray-100 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-xl font-bold text-purple-600 mb-2">AI-Powered Insights</h3>
            <p className="text-gray-700">Get personalized investment insights using machine learning tools.</p>
          </div>
        </div>
      </section>

      {/* 🗣 Testimonials */}
      <section className="py-16 px-6 bg-gradient-to-r from-gray-50 to-gray-100 text-center">
        <h2 className="text-3xl font-semibold mb-12 text-gray-800">What Our Users Say</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow text-left">
            <p className="text-gray-700 italic">"WeCoinvisors helped me understand the stock market with ease!"</p>
            <div className="mt-4 font-bold text-purple-700">— Priya, Student</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-left">
            <p className="text-gray-700 italic">"Live stock dashboard is fast and accurate. I love it."</p>
            <div className="mt-4 font-bold text-purple-700">— Rajesh, Retail Investor</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-left">
            <p className="text-gray-700 italic">"The educational content is perfect for beginners like me."</p>
            <div className="mt-4 font-bold text-purple-700">— Aisha, Aspiring Analyst</div>
          </div>
        </div>
      </section>

      {/* 📰 Latest Blog Posts */}
      <section className="py-16 px-6 bg-white text-center">
        <h2 className="text-3xl font-semibold mb-12 text-gray-800">Latest Updates</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="border rounded-lg p-6 shadow hover:shadow-md transition">
            <h3 className="text-xl font-bold text-purple-700 mb-2">📈 Understanding Nifty & Sensex</h3>
            <p className="text-gray-700 text-sm mb-4">
              Learn the basics of India’s major indices and how they affect your investments.
            </p>
            <a href="#" className="text-purple-600 font-semibold hover:underline">
              Read more →
            </a>
          </div>
          <div className="border rounded-lg p-6 shadow hover:shadow-md transition">
            <h3 className="text-xl font-bold text-purple-700 mb-2">🧠 Why FPI Matters</h3>
            <p className="text-gray-700 text-sm mb-4">
              Understand Foreign Portfolio Investment and how it influences Indian markets.
            </p>
            <a href="#" className="text-purple-600 font-semibold hover:underline">
              Read more →
            </a>
          </div>
          <div className="border rounded-lg p-6 shadow hover:shadow-md transition">
            <h3 className="text-xl font-bold text-purple-700 mb-2">🚀 Getting Started with Stock Analysis</h3>
            <p className="text-gray-700 text-sm mb-4">
              A quick guide for beginners to dive into stock analysis using our tools.
            </p>
            <a href="#" className="text-purple-600 font-semibold hover:underline">
              Read more →
            </a>
          </div>
        </div>
      </section>

      {/* 🧾 Footer */}
      <footer className="bg-gray-800 text-white text-center py-8">
        <div className="mb-2 text-sm">
          © {new Date().getFullYear()} WeCoinvisors Pvt Ltd. All rights reserved.
        </div>
        <div className="space-x-4 text-sm">
          <a href="/about" className="hover:underline">About</a>
          <a href="/contact" className="hover:underline">Contact</a>
          <a href="/terms" className="hover:underline">Terms</a>
        </div>
      </footer>
    </main>
  );
}
