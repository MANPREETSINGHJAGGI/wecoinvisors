import React from 'react';
import Navbar from '../../components/Navbar'; // ✅ CORRECT PATH

export default function DashboardPage() {
  return (
    <>
      <Navbar />
      <main style={{ padding: '2rem' }}>
        <h2>Welcome to the Dashboard</h2>
        {/* Add more components/content here */}
      </main>
    </>
  );
}
