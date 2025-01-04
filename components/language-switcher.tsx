'use client'

import { useLanguage } from '@/lib/language-context'
import { type Language } from '@/lib/translations'

export function LanguageSwitcher() {
  const { currentLanguage, setLanguage } = useLanguage()

  return (
    <div className="fixed top-4 right-4 flex items-center gap-2">
      <select
        value={currentLanguage}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="bg-background/80 backdrop-blur-sm border rounded-lg px-2 py-1 text-sm"
      >
        <option value="en">English</option>
        <option value="fr">Français</option>
        <option value="es">Español</option>
      </select>
    </div>
  )
} 