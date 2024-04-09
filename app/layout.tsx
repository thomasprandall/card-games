import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'React Games',
  description: 'By Thomas Randall',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen py-24">
          {children}
        </main>
      </body>
    </html>
  )
}
