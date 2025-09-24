"use client";

import React from "react";
import Link from "next/link";   // ✅ Fix: Add this
import { useRouter } from "next/navigation";

export default function Home() {
  const [symbols, setSymbols] = useState("");
  const [mode, setMode] = useState<"default" | "custom">("default");
  const router = useRouter();

  const handleExplore = () => {
    const base = "/dashboard/stocks";
    if (mode === "custom" && symbols.trim()) {
      router.push(`${base}?symbols=${encodeURIComponent(symbols)}`);
    } else {
      router.push(base);
    }
  };

  return (
    <main className="min-h-screen text-wecoin-blue glossy-bg">
      {/* Navbar */}
      <nav className="flex justify-center gap-6 py-4 bg-black/80 border-b border-gold backdrop-blur">
        <a href="/" className="nav-link">Home</a>
        <a href="/dashboard/stocks" className="nav-link">Stocks</a>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <h1 className="text-6xl font-extrabold mb-4 glow-text">
          <span>WeCoinvisors</span> 🚀
        </h1>
        <p className="text-2xl max-w-2xl mb-4 opacity-90">
          Leading a Cohort of People in Stocks & Education — Live, Interactive, AI-powered 🚀
        </p>

        {/* Moving ticker text */}
        <div className="overflow-hidden whitespace-nowrap border-t border-b border-gold py-2 mb-8 w-full">
          <div className="animate-marquee inline-block">
            📈 Live Stock Data • 📚 Educational Resources • 🤖 AI Insights • 💡 Smart Investing • 📊 Real-Time Analysis
          </div>
        </div>

        {/* Mode selection */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={() => setMode("default")}
            className={`px-5 py-2 rounded font-semibold shadow-md transition ${
              mode === "default"
                ? "bg-gold text-black"
                : "bg-gray-800/80 text-wecoin-blue hover:bg-gray-700"
            }`}
          >
            📊 Default List
          </button>
          <button
            onClick={() => setMode("custom")}
            className={`px-5 py-2 rounded font-semibold shadow-md transition ${
              mode === "custom"
                ? "bg-gold text-black"
                : "bg-gray-800/80 text-wecoin-blue hover:bg-gray-700"
            }`}
          >
            ✏️ Custom Symbols
          </button>
        </div>

        {/* Input for custom mode */}
        import Link from "next/link";

<nav className="flex justify-center gap-6 py-4 bg-black/80 border-b border-gold backdrop-blur">
  <Link href="/" className="nav-link">Home</Link>
  <Link href="/dashboard/stocks" className="nav-link">Stocks</Link>
</nav>

      </section>

      {/* Features */}
      <section className="py-16 px-6 text-center bg-black/70">
        <h2 className="text-3xl font-semibold mb-12">Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="p-6 bg-gray-900/90 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-xl font-bold mb-2">Live Stock Data</h3>
            <p>Track real-time stock movements from the NSE market.</p>
          </div>
          <div className="p-6 bg-gray-900/90 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-xl font-bold mb-2">Educational Resources</h3>
            <p>Learn stock market concepts through interactive lessons and guides.</p>
          </div>
          <div className="p-6 bg-gray-900/90 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-xl font-bold mb-2">AI-Powered Insights</h3>
            <p>Get personalized investment insights using machine learning tools.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6 text-center bg-black/70">
        <h2 className="text-3xl font-semibold mb-12">What Our Users Say</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-gray-900/90 p-6 rounded-lg shadow text-left">
            <p className="italic">"WeCoinvisors helped me understand the stock market with ease!"</p>
            <div className="mt-4 font-bold">— Priya, Student</div>
          </div>
          <div className="bg-gray-900/90 p-6 rounded-lg shadow text-left">
            <p className="italic">"Live stock dashboard is fast and accurate. I love it."</p>
            <div className="mt-4 font-bold">— Rajesh, Retail Investor</div>
          </div>
          <div className="bg-gray-900/90 p-6 rounded-lg shadow text-left">
            <p className="italic">"The educational content is perfect for beginners like me."</p>
            <div className="mt-4 font-bold">— Aisha, Aspiring Analyst</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/80 text-center py-8 border-t border-gold backdrop-blur">
        <div className="mb-2 text-sm">
          © {new Date().getFullYear()} WeCoinvisors Pvt Ltd. All rights reserved.
        </div>
        <div className="space-x-4 text-sm">
          <a href="/about" className="nav-link">About</a>
          <a href="/contact" className="nav-link">Contact</a>
          <a href="/terms" className="nav-link">Terms</a>
        </div>
      </footer>
    </main>
  );
}
