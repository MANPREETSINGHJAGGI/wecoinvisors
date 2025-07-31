"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { auth } from "@/lib/firebase"; // ✅ Correct import

export default function VerifyPage() {
  const router = useRouter();

  useEffect(() => {
    const completeSignIn = async () => {
      const url = window.location.href;

      // Check if this is a valid email link
      if (isSignInWithEmailLink(auth, url)) {
        const email = window.localStorage.getItem("emailForSignIn");

        if (!email) {
          alert("Missing email. Please go back and enter your email again.");
          router.push("/login");
          return;
        }

        try {
          await signInWithEmailLink(auth, email, url);
          window.localStorage.removeItem("emailForSignIn");
          router.push("/dashboard/stocks");
        } catch (error) {
          console.error("Sign-in error:", error);
          alert("Failed to sign in. Please try again.");
          router.push("/login");
        }
      } else {
        alert("Invalid or expired login link.");
        router.push("/login");
      }
    };

    completeSignIn();
  }, [router]);

  return <p className="p-6 text-lg">🔄 Verifying your login link...</p>;
}
