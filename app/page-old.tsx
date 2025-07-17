// app/page.tsx
"use client";

import Navbar from "../components/Navbar";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="flex flex-col items-center justify-center text-center py-16 px-4">
        <h1 className="text-4xl font-bold text-blue-700 mb-6">Welcome to WeCoinvisors 👋</h1>
        <p className="text-lg text-gray-700 mb-8">
          This is your homepage. Learn, Trade, and Grow with confidence.
        </p>
        <a
          href="/login"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition duration-200"
        >
          Login Here
        </a>
      </main>
    </div>
  );
}
