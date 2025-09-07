"use client";

import { useState, useEffect } from "react";
import { sendSignInLinkToEmail, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/dashboard/stocks");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const actionCodeSettings = {
      url: `${window.location.origin}/login/verify`,
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      toast.success("✅ Magic login link sent! Check your email.");
      window.localStorage.setItem("emailForSignIn", email);
      setEmail("");
    } catch (err: any) {
      toast.error(err.message || "Failed to send login link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-900 text-white px-4">
      <div className="w-full max-w-xs bg-gray-800 shadow-lg rounded-lg p-4 border border-gray-700 text-center">
        <h1 className="text-lg font-bold text-yellow-400 mb-1">
          🔐 Login to WeCoinvisors
        </h1>
        <p className="text-gray-400 text-xs mb-4">
          Enter your email to receive a secure magic link
        </p>

        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            type="email"
            placeholder="Enter email"
            className="w-full px-2 py-1 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-xs"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 text-black font-semibold py-1 rounded hover:bg-yellow-500 transition disabled:opacity-50 text-xs"
          >
            {loading ? "Sending..." : "Send Magic Link"}
          </button>
        </form>

        <p className="text-center text-[10px] text-gray-500 mt-3">
          🎁 Free access now. Subscribe for ₹1 / $1 to unlock full features 🎉
        </p>
      </div>
    </main>
  );
}
