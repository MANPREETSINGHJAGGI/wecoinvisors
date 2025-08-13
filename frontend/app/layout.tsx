

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata = {
  title: "WeCoinvisors",
  description: "Empowering Investors with Education and Insights",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNavbar = pathname === "/login" || pathname.startsWith("/login/verify");

  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-dark text-grayText font-sans min-h-screen">
        <AuthProvider>
          {!hideNavbar && <Navbar />}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
