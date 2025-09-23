import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Outreach Management System',
  description: 'Manage your contacts and email campaigns',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>{children}</body>
    </html>
  )
}
