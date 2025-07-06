// app/layout.tsx
export const metadata = {
  title: 'WeCoinvisors',
  description: 'Smart cryptocurrency insights and tools',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-black">{children}</body>
    </html>
  );
}
