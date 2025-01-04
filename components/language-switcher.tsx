'use client'

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-context"

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="fixed top-4 right-4 flex items-center gap-2">
      <Button
        variant={language === 'en' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setLanguage('en')}
      >
        EN
      </Button>
      <Button
        variant={language === 'fr' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setLanguage('fr')}
      >
        FR
      </Button>
    </div>
  )
} 