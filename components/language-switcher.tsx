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
      className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90"
      title={language === 'en' ? 'Switch to French' : 'Switch to English'}
    >
      <Languages className="h-5 w-5" />
      <span className="sr-only">
        {language === 'en' ? 'Switch to French' : 'Switch to English'}
      </span>
    </Button>
  )
} 