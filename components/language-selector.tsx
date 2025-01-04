'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Languages } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import type { Language } from '@/lib/translations'

export function LanguageSelector() {
  const { t, currentLanguage, setLanguage } = useLanguage()

  const languages: Language[] = ['en', 'fr', 'es']

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 right-14 z-50 rounded-full bg-background/80 backdrop-blur-sm"
        >
          <Languages className="h-5 w-5" />
          <span className="sr-only">{t('language.select')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => setLanguage(lang)}
            className={currentLanguage === lang ? 'bg-accent' : ''}
          >
            {t(`language.${lang}`)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 