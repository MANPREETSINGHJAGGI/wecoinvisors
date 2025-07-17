// app/page.tsx
"use client";

import Navbar from "../components/Navbar";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="flex flex-col items-center justify-center py-20">
        <h1 className="text-4xl font-bold mb-4 text-blue-800">
          Welcome to WeCoinvisors 👋
        </h1>
        <p className="text-lg mb-8 text-gray-700">This is your homepage.</p>
        <Link
          href="/login"
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
        >
          Login Here
        </Link>
      </main>
    </div>
  );
}
