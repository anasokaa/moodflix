'use client'

import { ReactNode } from 'react'
import { LanguageProvider as BaseLanguageProvider } from '@/lib/language-context'

export function LanguageProvider({ children }: { children: ReactNode }) {
  return <BaseLanguageProvider>{children}</BaseLanguageProvider>
} 