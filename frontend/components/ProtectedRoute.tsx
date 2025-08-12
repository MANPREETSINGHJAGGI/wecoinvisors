"use client";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // ✅ Since auth is removed, just render children directly
  return <>{children}</>;
}
