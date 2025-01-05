import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from '@/components/providers/language-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MoodFlix - Movie Recommendations Based on Your Mood',
  description: 'Get personalized movie recommendations based on your current mood using AI-powered emotion detection.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          <div className="min-h-screen bg-gradient-to-b from-black via-background to-primary/5">
            {children}
          </div>
        </LanguageProvider>
      </body>
    </html>
  )
} 