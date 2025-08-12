"use client"; // Needed if using hooks like usePathname in a layout

import React from "react";
import { usePathname } from "next/navigation";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div>
      {/* You can use pathname here if needed */}
      {children}
    </div>
  );
}
