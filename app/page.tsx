'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/language-context'

export default function HomePage() {
  const router = useRouter()
  const { t } = useLanguage()

  useEffect(() => {
    // Check if platforms are selected
    const selectedPlatforms = sessionStorage.getItem('selectedPlatforms')
    if (!selectedPlatforms) {
      router.push('/streaming-platforms')
    } else {
      router.push('/client-page')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-background to-primary/5 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </motion.div>
    </div>
  )
} 