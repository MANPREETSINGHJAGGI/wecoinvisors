"use client";

import { useState } from "react";
import { sendSignInLinkToEmail } from "firebase/auth";
import { auth } from "@/firebase/firebase";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const actionCodeSettings = {
      url: `${window.location.origin}/login/verify`,
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      toast.success("OTP link sent! Check your email.");
      window.localStorage.setItem("emailForSignIn", email);
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP");
    }
  };

  return (
    <main className="min-h-screen bg-dark text-white flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md bg-black p-8 rounded-xl shadow-gold">
        <h1 className="text-2xl font-bold text-gold mb-4 text-center">🔐 Login to WeCoinvisors</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-gold"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-gold text-black font-semibold py-2 rounded hover:bg-yellow-400 transition"
          >
            Send OTP Link
          </button>
        </form>
        <p className="text-center text-sm text-grayText mt-4">
          🎁 You’re using it free… But remember: you can own it in just ₹1 / $1 / CHF1 🎉
        </p>
      </div>
    </main>
  );
}
