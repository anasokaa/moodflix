'use client'

import { useLanguage } from '@/lib/language-context'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

interface WelcomeScreenProps {
  onStart: () => void
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-8"
      >
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 text-transparent bg-clip-text">
          {t('welcome.title')}
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground">
          {t('welcome.subtitle')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 max-w-4xl mx-auto">
          <div className="p-6 rounded-lg bg-card hover:bg-card/80 transition-colors">
            <div className="text-pink-500 text-3xl mb-4">📸</div>
            <p className="text-card-foreground">{t('camera.instructions')}</p>
          </div>
          <div className="p-6 rounded-lg bg-card hover:bg-card/80 transition-colors">
            <div className="text-violet-500 text-3xl mb-4">🎯</div>
            <p className="text-card-foreground">{t('movies.title')}</p>
          </div>
          <div className="p-6 rounded-lg bg-card hover:bg-card/80 transition-colors">
            <div className="text-yellow-500 text-3xl mb-4">💎</div>
            <p className="text-card-foreground">{t('welcome.description')}</p>
          </div>
        </div>

        <Button
          onClick={onStart}
          size="lg"
          className="text-lg px-8 py-6 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          {t('buttons.letsRoll')}
        </Button>
      </motion.div>
    </div>
  )
} 