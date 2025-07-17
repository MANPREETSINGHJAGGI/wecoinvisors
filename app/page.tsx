"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-col items-center justify-start min-h-screen px-4 py-10 bg-gradient-to-b from-blue-50 to-white text-gray-800 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-gradient-to-br from-indigo-100 via-white to-blue-100 opacity-30 animate-pulse"></div>
        </div>

        {/* Logo with animation */}
        <div className="mb-2 z-10 animate-fade-in">
          <Image
            src="/images/wecoinvisors-logo.png"
            alt="WeCoinvisors Logo"
            width={160}
            height={160}
            className="mx-auto"
          />
        </div>

        {/* Slogan */}
        <p className="text-center text-sm text-gray-500 mb-6 z-10 animate-fade-in delay-100">
          Empowering minds. Guiding investments.
        </p>

        {/* Welcome Heading */}
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 z-10 animate-fade-in delay-200">
          Welcome to <span className="text-blue-600">WeCoinvisors</span> 👋
        </h1>

        {/* Subheading */}
        <p className="text-center text-gray-600 max-w-2xl text-lg leading-relaxed mb-10 z-10 animate-fade-in delay-300">
          Your trusted platform for education and stock market insights. <br />
          We empower students and investors with the knowledge they need.
        </p>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 z-10 animate-fade-in delay-500">
          <Link
            href="/login"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-transform duration-200 text-white rounded-md text-lg shadow-md w-64 text-center"
          >
            Login Here
          </Link>
          <Link
            href="/dashboard/education"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 hover:scale-105 transition-transform duration-200 text-white rounded-md text-lg shadow-md w-64 text-center"
          >
            Education Platform
          </Link>
          <Link
            href="/dashboard/stocks"
            className="px-6 py-3 bg-green-600 hover:bg-green-700 hover:scale-105 transition-transform duration-200 text-white rounded-md text-lg shadow-md w-64 text-center"
          >
            Stock Market Insights
          </Link>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-400 text-sm z-10">
          © 2025 WeCoinvisors · All Rights Reserved
        </footer>
      </main>
    </>
  );
}
