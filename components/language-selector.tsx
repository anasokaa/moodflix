'use client'

import { Button } from '@/components/ui/button'
import { useLanguage, type Language } from '@/lib/language-context'

const languageNames: Record<Language, string> = {
  en: 'English 🇬🇧',
  fr: 'Français 🇫🇷'
}

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage()

  const languages: Language[] = ['en', 'fr']

  return (
    <div className="flex gap-2">
      {languages.map((lang) => (
        <Button
          key={lang}
          variant={language === lang ? 'default' : 'outline'}
          onClick={() => setLanguage(lang)}
          className="rounded-full"
        >
          {languageNames[lang]}
        </Button>
      ))}
    </div>
  )
} 