'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebaseClient";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";

export default function VerifyPage() {
  const router = useRouter();

  useEffect(() => {
    const completeLogin = async () => {
      try {
        const email = window.localStorage.getItem("emailForSignIn");
        if (!email) throw new Error("Email missing from localStorage");

        if (isSignInWithEmailLink(auth, window.location.href)) {
          await signInWithEmailLink(auth, email, window.location.href);
          window.localStorage.removeItem("emailForSignIn");
          alert("✅ Logged in successfully!");
          router.push("/dashboard/stocks");
        }
      } catch (err) {
        console.error(err);
        alert("❌ Failed to verify login. Try again.");
        router.push("/login");
      }
    };

    completeLogin();
  }, [router]);

  return (
    <div className="p-6">
      <h1 className="text-xl">⏳ Verifying OTP Link...</h1>
    </div>
  );
}
