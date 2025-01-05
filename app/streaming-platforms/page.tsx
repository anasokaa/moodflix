'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/language-context'

const STREAMING_PLATFORMS = [
  { id: 'netflix', name: 'Netflix', icon: '🎬' },
  { id: 'disney', name: 'Disney+', icon: '👸' },
  { id: 'prime', name: 'Prime Video', icon: '📦' },
  { id: 'apple', name: 'Apple TV+', icon: '🍎' },
  { id: 'hbo', name: 'HBO Max', icon: '🎭' },
  { id: 'shudder', name: 'Shudder', icon: '👻' }
]

export default function StreamingPlatformsPage() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const router = useRouter()
  const { t } = useLanguage()

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    )
  }

  const handleContinue = () => {
    if (selectedPlatforms.length > 0) {
      // Store selected platforms in sessionStorage
      sessionStorage.setItem('selectedPlatforms', JSON.stringify(selectedPlatforms))
      router.push('/camera')
    }
  }

  useEffect(() => {
    // Check if we have viewing mode
    const viewingMode = sessionStorage.getItem('viewingMode')
    if (!viewingMode) {
      router.push('/')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-background to-primary/5 py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto space-y-8"
        >
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Select Your Streaming Services</h1>
            <p className="text-muted-foreground">
              Choose the platforms you have access to, and we'll suggest movies available on them.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {STREAMING_PLATFORMS.map(platform => (
              <motion.div
                key={platform.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  className={`p-6 cursor-pointer transition-colors ${
                    selectedPlatforms.includes(platform.id)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card hover:bg-primary/10'
                  }`}
                  onClick={() => togglePlatform(platform.id)}
                >
                  <div className="flex flex-col items-center gap-2 text-center">
                    <span className="text-2xl">{platform.icon}</span>
                    <span className="font-medium">{platform.name}</span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center"
          >
            <Button
              size="lg"
              className={`px-8 ${
                selectedPlatforms.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={handleContinue}
              disabled={selectedPlatforms.length === 0}
            >
              Continue to Camera
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
} 