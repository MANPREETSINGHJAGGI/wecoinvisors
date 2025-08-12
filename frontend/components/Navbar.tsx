"use client";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

import Link from "next/link";

export const useAuth = () => useContext(AuthContext);

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

              )}
      </div>
    </nav>
  );
}
