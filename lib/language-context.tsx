'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { translations, type Language } from './translations'

interface LanguageContextType {
  currentLanguage: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en')

  const t = useCallback((key: string): string => {
    const keys = key.split('.')
    let value: any = translations[currentLanguage]
    
    for (const k of keys) {
      if (value === undefined) return key
      value = value[k]
    }
    
    return value || key
  }, [currentLanguage])

  return (
    <LanguageContext.Provider 
      value={{
        currentLanguage,
        setLanguage: setCurrentLanguage,
        t
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
} 