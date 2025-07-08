'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('logged-in');
    if (!isLoggedIn) {
      router.push('/login');
    }
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-white text-black">
      <h1 className="text-3xl font-bold mb-4">Welcome to WeCoinvisors 👋</h1>
      <p className="text-lg">You are now logged in via phone OTP.</p>
    </main>
  );
}
