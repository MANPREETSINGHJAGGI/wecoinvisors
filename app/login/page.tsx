'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const sendLoginLink = async () => {
    setMessage('Sending link...');
    try {
      const res = await fetch('/api/auth/send-link', {
        method: 'POST',
        body: JSON.stringify({ email }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        setMessage('✅ Check your inbox for the login link!');
      } else {
        setMessage('❌ Failed to send link. Try again.');
      }
    } catch (err) {
      console.error(err);
      setMessage('⚠️ Something went wrong.');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full p-8 bg-white rounded shadow">
        <h2 className="text-2xl font-semibold mb-4 text-center text-purple-700">Login to WeCoinvisors</h2>
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full border rounded px-4 py-2 mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          onClick={sendLoginLink}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded transition"
        >
          Send Login Link
        </button>
        {message && <p className="mt-4 text-center text-sm text-gray-600">{message}</p>}
      </div>
    </main>
  );
}
