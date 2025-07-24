import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '1999CHAMPCUTZ',
  description: 'Premium barbershop experience with skilled professionals dedicated to perfecting your style',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
} 