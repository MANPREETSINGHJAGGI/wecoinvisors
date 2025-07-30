// app/login/page.tsx
"use client";
import { useState, useEffect } from "react";
import { auth, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from "../../utils/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && isSignInWithEmailLink(auth, window.location.href)) {
      const storedEmail = window.localStorage.getItem("emailForSignIn");
      if (storedEmail) {
        signInWithEmailLink(auth, storedEmail, window.location.href)
          .then(() => {
            window.localStorage.removeItem("emailForSignIn");
            setMessage("✅ Logged in successfully!");
            setError("");
            setTimeout(() => router.push("/dashboard"), 1500);
          })
          .catch((err) => {
            setError("❌ Login failed. Try again.");
            console.error(err);
          });
      } else {
        setError("⚠️ No email stored. Please try again.");
      }
    }
  }, []);

  const handleLogin = async () => {
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      await sendSignInLinkToEmail(auth, email, {
        url: "http://localhost:3000/login",
        handleCodeInApp: true,
      });
      window.localStorage.setItem("emailForSignIn", email);
      setMessage("📨 OTP link sent to your email.");
      setError("");
    } catch (err: any) {
      setError("❌ Failed to send email. Try again.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">Login with Email OTP</h2>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded mb-4"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Send OTP Link
        </button>

        {message && <p className="mt-4 text-green-600">{message}</p>}
        {error && <p className="mt-4 text-red-600">{error}</p>}
      </div>
    </div>
  );
}
