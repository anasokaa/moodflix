import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { LanguageProvider } from '@/lib/language-context'
import { LanguageSwitcher } from '@/components/language-switcher'
import { cn } from '@/lib/utils'
import { fontSans } from '@/styles/fonts'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MoodFlix',
  description: 'Cinematic therapy for every mood',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <LanguageProvider>
            <LanguageSwitcher />
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
} 