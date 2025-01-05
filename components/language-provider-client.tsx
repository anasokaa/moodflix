'use client'

import { ReactNode, useEffect } from 'react'
import { LanguageProvider } from '@/lib/language-context'

export function LanguageProviderClient({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Initialize any client-side language preferences here
  }, [])

  return <LanguageProvider>{children}</LanguageProvider>
} 