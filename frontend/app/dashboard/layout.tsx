// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="bg-black text-white min-h-screen">
      {children}
    </main>
  )
}
