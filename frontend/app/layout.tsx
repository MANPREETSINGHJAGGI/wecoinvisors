// frontend/app/layout.tsx
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export const metadata = {
  title: "WeCoinvisors",
  description: "Empowering Investors with Education and Insights",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-dark text-grayText font-sans min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
