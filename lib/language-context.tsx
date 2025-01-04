'use client'

import { createContext, useContext, useState } from 'react'
import { translations, type Language } from './translations'

interface LanguageContextType {
  t: (key: string) => string
  currentLanguage: Language
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en')

  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = translations[currentLanguage]
    
    for (const k of keys) {
      if (value === undefined) return key
      value = value[k]
    }
    
    return value || key
  }

  return (
    <LanguageContext.Provider 
      value={{
        t,
        currentLanguage,
        setLanguage: setCurrentLanguage
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
} 