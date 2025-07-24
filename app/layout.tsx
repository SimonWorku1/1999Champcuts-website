import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '1999CHAMPCUTZ',
  description: 'Premium barbershop experience with skilled professionals dedicated to perfecting your style',
  icons: {
    icon: [
      {
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE5LjUgMTQuNUwxMy41IDguNUwxMiA3TDEwLjUgOC41TDE2LjUgMTQuNUwxOS41IDE0LjVaIiBzdHJva2U9IiM2NzM0MjAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik03LjUgMTYuNUwxMy41IDEwLjVMMTUgMTJMMTMuNSAxMy41TDcuNSAxOS41TDQuNSAxOS41VjE2LjVINy41WiIgc3Ryb2tlPSIjNjczNDIwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K',
        type: 'image/svg+xml',
      },
    ],
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