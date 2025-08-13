
// File: app/layout.tsx

"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AuthProvider>
      <Navbar currentPath={pathname} />
      <main>{children}</main>
    </AuthProvider>
  );
}
