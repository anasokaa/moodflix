'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useLanguage } from '@/lib/language-context'
import { Users, ChevronRight } from 'lucide-react'

export default function GroupSetupPage() {
  const [numberOfPeople, setNumberOfPeople] = useState(2)
  const router = useRouter()
  const { t } = useLanguage()

  const handleContinue = () => {
    // Store the number of people in sessionStorage
    sessionStorage.setItem('numberOfPeople', numberOfPeople.toString())
    sessionStorage.setItem('currentPersonIndex', '0')
    sessionStorage.setItem('groupEmotions', JSON.stringify([]))
    router.push('/streaming-platforms')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-background to-primary/5 py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto space-y-8"
        >
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Group Movie Night! 🎬</h1>
            <p className="text-muted-foreground">
              Let's find a movie that everyone will enjoy!
            </p>
          </div>

          <Card className="p-6 space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-center">How many people are watching?</h2>
              
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setNumberOfPeople(Math.max(2, numberOfPeople - 1))}
                  disabled={numberOfPeople <= 2}
                >
                  -
                </Button>
                <div className="flex items-center gap-2 min-w-[100px] justify-center">
                  <Users className="w-5 h-5" />
                  <span className="text-2xl font-bold">{numberOfPeople}</span>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setNumberOfPeople(Math.min(4, numberOfPeople + 1))}
                  disabled={numberOfPeople >= 4}
                >
                  +
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-center text-muted-foreground">
                We'll take a photo of each person to analyze their mood and find the perfect movie for everyone!
              </p>
            </div>
          </Card>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center"
          >
            <Button
              size="lg"
              className="px-8"
              onClick={handleContinue}
            >
              Continue <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
} 