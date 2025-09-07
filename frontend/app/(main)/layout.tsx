
// File: app/layout.tsx

"use client";

import { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import AuthProvider from "@/components/AuthProvider";
import { usePathname } from "next/navigation";

export default function MainLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AuthProvider>
      <Navbar currentPath={pathname} />
      <main>{children}</main>
    </AuthProvider>
  );
}
