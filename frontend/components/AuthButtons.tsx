"use client";

import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AuthButtons() {
  const { user } = useAuth();
  const router = useRouter();

  // ✅ Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success("✅ Logged in successfully!");
      router.push("/dashboard/stocks"); // Redirect to dashboard
    } catch (err: any) {
      toast.error(err.message || "Google Sign-In failed");
    }
  };

  // ✅ Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("👋 Logged out successfully!");
      router.push("/"); // Redirect to home
    } catch (err: any) {
      toast.error(err.message || "Logout failed");
    }
  };

  return (
    <div className="flex flex-col items-center space-y-3 w-full">
      {user ? (
        <>
          <p className="text-green-600 font-semibold text-center">
            Welcome, {user.displayName || user.email}
          </p>
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </>
      ) : (
        <button
          onClick={handleGoogleSignIn}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Sign in with Google
        </button>
      )}
    </div>
  );
}
