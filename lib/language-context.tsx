'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations } from './translations'

type Language = 'en' | 'fr'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, any>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

function getStoredLanguage(): Language {
  if (typeof window === 'undefined') return 'en'
  return (localStorage.getItem('language') as Language) || 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')

  useEffect(() => {
    const storedLang = getStoredLanguage()
    if (storedLang && (storedLang === 'en' || storedLang === 'fr')) {
      setLanguage(storedLang)
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang)
    }
  }

  const t = (key: string, params?: Record<string, any>) => {
    const keys = key.split('.')
    let value = translations[language]

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        console.warn(`Translation key not found: ${key}`)
        return key
      }
    }

    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string: ${key}`)
      return key
    }

    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (_, key) => 
        params[key]?.toString() || `{{${key}}}`
      )
    }

    return value
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
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