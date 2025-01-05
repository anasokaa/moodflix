'use client'

import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/language-context'
import { Languages } from 'lucide-react'

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fr' : 'en')
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLanguage}
      className="rounded-full"
      title={language === 'en' ? 'Switch to French' : 'Switch to English'}
    >
      <Languages className="w-5 h-5" />
      <span className="sr-only">
        {language === 'en' ? 'Switch to French' : 'Switch to English'}
      </span>
    </Button>
  )
} 