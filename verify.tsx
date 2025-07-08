'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Verify() {
  const [otp, setOtp] = useState('');
  const router = useRouter();

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === '1234') {
      localStorage.setItem('logged-in', 'true');
      router.push('/dashboard');
    } else {
      alert('Invalid OTP. Use 1234 for testing.');
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-white text-black">
      <h1 className="text-2xl font-bold mb-4">Enter OTP</h1>
      <form onSubmit={handleVerify} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Enter OTP (try 1234)"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="p-2 border rounded w-72"
          required
        />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
          Verify
        </button>
      </form>
    </main>
  );
}
