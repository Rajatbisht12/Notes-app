// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import Navbar from '@/components/Navbar'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NoteApp - Organize Your Thoughts',
  description: 'A modern notes and bookmarks organizer',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} bg-gray-50 min-h-screen`}>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <footer className="bg-white py-6 border-t">
              <div className="container mx-auto px-4 text-center text-gray-500">
                © {new Date().getFullYear()} NoteApp. All rights reserved.
              </div>
            </footer>
          </div>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}