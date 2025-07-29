"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-dark text-white p-6">
      <h1 className="text-2xl font-bold text-gold mb-4">👤 Your Profile</h1>

      <div className="bg-gray-900 rounded p-6 shadow-md max-w-md">
        <p className="text-lg mb-2">
          <span className="text-grayText">Email:</span> {user.email}
        </p>

        <button
          onClick={logout}
          className="mt-4 bg-gold text-black font-semibold px-4 py-2 rounded shadow-gold hover:opacity-90"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
