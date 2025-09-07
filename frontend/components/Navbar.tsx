"use client";

import Link from "next/link";

interface NavbarProps {
  currentPath?: string;
}

export default function Navbar({ currentPath }: NavbarProps) {
  return (
    <nav>
      {/* Example usage */}
      <ul>
        <li className={currentPath === "/" ? "active" : ""}>
          <Link href="/">Home</Link>
        </li>
        <li className={currentPath === "/dashboard/stocks" ? "active" : ""}>
          <Link href="/dashboard/stocks">Stocks</Link>
        </li>
      </ul>
    </nav>
  );
}
