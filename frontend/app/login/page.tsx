"use client";

import { useState } from "react";
import { sendSignInLinkToEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";
import AuthButtons from "@/components/AuthButtons";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const actionCodeSettings = {
      url: `${window.location.origin}/login/verify`,
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      toast.success("✅ OTP link sent! Check your email.");
      window.localStorage.setItem("emailForSignIn", email);
      setEmail("");
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-bold text-purple-700 text-center mb-4">
          🔐 Login to WeCoinvisors
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Choose your preferred login method
        </p>

        {/* Google Sign-In / Logout */}
        <div className="mb-6">
          <AuthButtons />
        </div>

        <div className="flex items-center my-6">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-2 text-gray-400 text-sm">OR</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Email OTP Login */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white font-semibold py-2 rounded hover:bg-purple-700 transition disabled:opacity-50"
          >
            {loading ? "Sending OTP..." : "Send OTP Link"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-4">
          🎁 You’re using it free… Subscribe for ₹1 / $1 to own it 🎉
        </p>
      </div>
    </main>
  );
}
