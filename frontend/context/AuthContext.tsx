"use client";

import { useAuth } from "@/context/AuthContext";

export default function AuthButtons() {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col items-center space-y-3 w-full">
      {user ? (
        <>
          <p className="text-green-600 font-semibold text-center">
            Welcome, {user.name}
          </p>
          <button
            onClick={logout}
            className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </>
      ) : (
        <button
          onClick={() => console.log("Login disabled in guest mode.")}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Sign in
        </button>
      )}
    </div>
  );
}
