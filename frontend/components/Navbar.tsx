"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Navbar() {
  const { user } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/"; // Redirect to home after logout
  };

  return (
    <nav className="bg-white shadow-md dark:bg-gray-900 py-4 px-6 flex justify-between items-center">
      <Link href="/" className="text-xl font-bold text-purple-600">
        🚀 WeCoinvisors
      </Link>

      <div className="flex items-center space-x-4">
        <Link
          href="/dashboard/stocks"
          className="text-gray-700 dark:text-gray-200 hover:text-purple-600"
        >
          Dashboard
        </Link>

        {!user ? (
          <Link
            href="/login"
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
          >
            Login
          </Link>
        ) : (
          <>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {user.email}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
