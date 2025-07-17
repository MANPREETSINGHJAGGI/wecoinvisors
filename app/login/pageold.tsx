// app/login/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  auth,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "../../utils/firebase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const actionCodeSettings = {
    url: "http://localhost:3000/login",
    handleCodeInApp: true,
  };

  useEffect(() => {
    if (typeof window !== "undefined" && isSignInWithEmailLink(auth, window.location.href)) {
      const storedEmail = window.localStorage.getItem("emailForSignIn");
      if (storedEmail) {
        signInWithEmailLink(auth, storedEmail, window.location.href)
          .then(() => {
            setMessage("Successfully logged in!");
            window.localStorage.removeItem("emailForSignIn");
          })
          .catch((error) => {
            setMessage(`Error: ${error.message}`);
          });
      }
    }
  }, []);

  const handleLogin = async () => {
    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem("emailForSignIn", email);
      setMessage("Check your email for the login link.");
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">Email OTP Login</h1>
      <input
        type="email"
        placeholder="Enter your email"
        className="mb-4 px-4 py-2 border border-gray-300 rounded w-full max-w-md"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
      >
        Send OTP
      </button>
      {message && <p className="mt-4 text-gray-700">{message}</p>}
    </div>
  );
}
