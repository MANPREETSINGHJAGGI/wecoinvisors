import './globals.css'
import { ReactNode } from 'react'

export const metadata = {
  title: 'WeCoinvisors',
  description: 'Smart crypto investment tools',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}