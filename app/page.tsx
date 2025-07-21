// app/page.tsx

'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-br from-blue-100 to-white text-center">
      {/* Logo */}
      <Image src="/logo.png" alt="WeCoinvisors Logo" width={100} height={100} className="mb-6" />

      {/* Heading */}
      <h1 className="text-4xl font-bold mb-4 text-gray-800">
        Welcome to WeCoinvisors 🚀
      </h1>

      {/* Subheading */}
      <p className="text-lg text-gray-600 mb-8 max-w-xl">
        Your gateway to smart stock insights, live dashboards, and data-driven investment strategies.
      </p>

      {/* Button */}
      <Link href="/dashboard/stocks">
        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition">
          Go to Live Stock Dashboard
        </button>
      </Link>
    </main>
  );
}
