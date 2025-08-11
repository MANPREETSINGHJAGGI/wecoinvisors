"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  isSignInWithEmailLink,
  signInWithEmailLink,
  getIdToken,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";

export default function VerifyPage() {
  const router = useRouter();

  useEffect(() => {
    const completeSignIn = async () => {
      const url = window.location.href;
      const backendUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "https://wecoinvisors.onrender.com";

      // 1️⃣ Validate email link
      if (!isSignInWithEmailLink(auth, url)) {
        toast.error("❌ Invalid or expired login link.");
        return router.push("/login");
      }

      const email = window.localStorage.getItem("emailForSignIn");
      if (!email) {
        toast.error("📩 Email not found. Please enter it again.");
        return router.push("/login");
      }

      try {
        // 2️⃣ Firebase sign-in
        const result = await signInWithEmailLink(auth, email, url);
        window.localStorage.removeItem("emailForSignIn");

        // 3️⃣ Get Firebase ID token
        const token = await getIdToken(result.user, true);

        // 4️⃣ Verify with backend
        const response = await fetch(`${backendUrl}/api/auth/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken: token }),
        });

        const data = await response.json();
        if (!response.ok || data?.error) {
          toast.error("⚠️ Server failed to verify login.");
          return router.push("/login");
        }

        // ✅ Success
        toast.success(`✅ Logged in as ${data.email || email}`);
        router.push("/dashboard/stocks");
      } catch (error) {
        console.error("Login Error:", error);
        toast.error("Login failed. Please try again.");
        router.push("/login");
      }
    };

    completeSignIn();
  }, [router]);

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50 text-gray-900">
      <div className="bg-white shadow-md rounded-lg p-6 text-center">
        <p className="text-lg animate-pulse">🔄 Verifying your login link...</p>
        <p className="text-sm text-gray-500 mt-2">Please wait a moment...</p>
      </div>
    </main>
  );
}
