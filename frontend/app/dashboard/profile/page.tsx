'use client';

import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-dark text-white p-6">
      <h1 className="text-2xl font-bold text-gold mb-4">👤 Your Profile</h1>

      <div className="bg-gray-900 rounded p-6 shadow-md max-w-md">
        {/* Profile content here */}
      </div>
    </div>
  );
}
