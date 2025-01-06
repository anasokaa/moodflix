'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations } from './translations'

export type Language = 'en' | 'fr'

type TranslationValue = string | Record<string, any>

interface TranslationObject {
  [key: string]: TranslationValue
}

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, any>) => string
}

const defaultLanguage: Language = 'en'

const LanguageContext = createContext<LanguageContextType>({
  language: defaultLanguage,
  setLanguage: () => {},
  t: (key) => key,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(defaultLanguage)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const savedLanguage = localStorage.getItem('language') as Language
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'fr')) {
      setLanguage(savedLanguage)
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    if (isClient) {
      localStorage.setItem('language', lang)
    }
  }

  const t = (key: string, params?: Record<string, any>) => {
    const keys = key.split('.')
    let value: TranslationValue = translations[language]

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as TranslationObject)[k]
      } else {
        return key
      }
    }

    if (typeof value !== 'string') {
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
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
} 