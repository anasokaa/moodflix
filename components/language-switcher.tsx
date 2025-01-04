'use client'

import { useLanguage } from '@/lib/language-context'
import { Button } from '@/components/ui/button'

type Language = 'en' | 'fr'

export function LanguageSwitcher() {
  const { currentLanguage, setLanguage } = useLanguage()

  const languages: Language[] = ['en', 'fr']
  const languageNames: Record<Language, string> = {
    en: 'English 🇬🇧',
    fr: 'Français 🇫🇷'
  }

  return (
    <div className="flex gap-2">
      {languages.map((lang) => (
        <Button
          key={lang}
          variant={currentLanguage === lang ? 'default' : 'outline'}
          onClick={() => setLanguage(lang)}
          className="rounded-full"
        >
          {languageNames[lang]}
        </Button>
      ))}
    </div>
  )
} 