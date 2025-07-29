"use client";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-dark text-grayText shadow-gold px-6 py-4 flex justify-between items-center animate-fadeInUp">
      <a href="/" className="text-gold text-xl font-bold hover:underline">WeCoinvisors</a>

      <div className="flex gap-4 items-center">
        <a href="/dashboard/stocks" className="hover:text-gold transition">Stocks</a>
        <a href="/dashboard/charts" className="hover:text-gold transition">Charts</a>

        {user && (
          <>
            <a href="/dashboard/profile" className="hover:text-gold transition">Profile</a>
            <span className="text-sm text-gray-400">{user.email}</span>
            <button onClick={logout} className="text-red-500 hover:underline">Sign Out</button>
          </>
        )}

        {!user && (
          <a href="/login" className="text-gold hover:underline">Login</a>
        )}
      </div>
    </nav>
  );
}
