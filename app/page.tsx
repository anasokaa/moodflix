'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/language-context'
import { UserRound, Users, Sparkles } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const { t } = useLanguage()

  const handleModeSelect = (mode: 'solo' | 'group') => {
    // Store the selected mode in sessionStorage
    sessionStorage.setItem('viewingMode', mode)
    if (mode === 'solo') {
      router.push('/streaming-platforms')
    } else {
      router.push('/group-setup')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-background to-primary/5">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto space-y-12 text-center"
        >
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
              MoodFlix ✨
            </h1>
            <p className="text-xl text-muted-foreground">
              Let's find the perfect movie for your mood!
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Who's watching today?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => handleModeSelect('solo')}
                  className="w-full h-32 text-lg bg-primary/10 hover:bg-primary/20 border-2 border-primary/20"
                >
                  <div className="flex flex-col items-center gap-4">
                    <UserRound className="w-8 h-8" />
                    <span>Just Me</span>
                  </div>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => handleModeSelect('group')}
                  className="w-full h-32 text-lg bg-primary/10 hover:bg-primary/20 border-2 border-primary/20"
                >
                  <div className="flex flex-col items-center gap-4">
                    <Users className="w-8 h-8" />
                    <span>With Others</span>
                  </div>
                </Button>
              </motion.div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-sm text-muted-foreground"
          >
            <p>Our AI will analyze your mood and suggest the perfect movie!</p>
            <p>Take a selfie and let the magic happen ✨</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
} 