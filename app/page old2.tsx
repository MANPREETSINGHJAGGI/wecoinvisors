"use client";
import Link from "next/link";
import Navbar from "../components/Navbar";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-b from-blue-100 to-white text-gray-800 transition-all">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 animate-fadeInUp">
          Welcome to <span className="text-blue-600">WeCoinvisors</span> 👋
        </h1>

        <p className="text-center text-gray-600 max-w-2xl text-lg mb-10 animate-fadeInUp delay-100">
          Your trusted platform for education and stock market insights.  
          <br className="hidden md:block" />
          We empower students and investors with the knowledge they need.
        </p>

        <div className="flex flex-col md:flex-row gap-4 animate-fadeInUp delay-200">
          <Link
            href="/login"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-lg font-semibold shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            Login
          </Link>
          <Link
            href="/dashboard/education"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-lg font-semibold shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            Education Platform
          </Link>
          <Link
            href="/dashboard/stocks"
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-lg font-semibold shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            Stock Market Insights
          </Link>
        </div>
      </main>
    </>
  );
}
