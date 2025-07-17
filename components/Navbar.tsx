// components/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClasses = (path: string) =>
    `text-blue-600 hover:underline ${pathname === path ? "underline font-semibold" : ""}`;

  return (
    <nav className="w-full sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white shadow-md">
      <Link href="/" className="text-2xl font-bold text-blue-700 flex items-center">
        <span className="mr-2">🔷</span>WeCoinvisors
      </Link>

      <div className="hidden md:flex space-x-4">
        <Link href="/login" className={linkClasses("/login")}>Login</Link>
        <Link href="/register" className={linkClasses("/register")}>Register</Link>
      </div>

      {/* Mobile Menu Toggle */}
      <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-blue-700">
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="absolute top-16 right-6 bg-white shadow-md rounded-lg p-4 flex flex-col space-y-2 md:hidden">
          <Link href="/login" className={linkClasses("/login")} onClick={() => setMenuOpen(false)}>Login</Link>
          <Link href="/register" className={linkClasses("/register")} onClick={() => setMenuOpen(false)}>Register</Link>
        </div>
      )}
    </nav>
  );
}
