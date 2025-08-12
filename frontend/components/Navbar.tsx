// components/Navbar.tsx
"use client";

import Link from "next/link";
import React from "react";

export default function Navbar() {
  return (
    <nav className="w-full flex items-center justify-between p-4 bg-white shadow-md">
      <Link href="/" className="text-xl font-bold text-blue-700">
        WeCoinvisors
      </Link>
      <div>
        <Link href="/login" className="mr-4 text-gray-600 hover:text-blue-700">
          Login
        </Link>
        <Link href="/register" className="text-gray-600 hover:text-blue-700">
          Register
        </Link>
      </div>
    </nav>
  );
}
