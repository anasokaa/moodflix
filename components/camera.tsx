'use client'

import { useRef, useState, useCallback } from 'react'
import { useLanguage } from '@/lib/language-context'
import { motion, AnimatePresence } from 'framer-motion'
import Webcam from 'react-webcam'

interface CameraProps {
  onCapture: (image: string) => void
  isLoading: boolean
}

export function Camera({ onCapture, isLoading }: CameraProps) {
  const webcamRef = useRef<Webcam>(null)
  const { t } = useLanguage()
  const [isStarted, setIsStarted] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const startCamera = useCallback(() => {
    try {
      setIsStarted(true)
      setError(null)
      // Start countdown from 3
      setCountdown(3)
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(timer)
            // Capture image when countdown reaches 0
            try {
              const imageSrc = webcamRef.current?.getScreenshot()
              if (imageSrc) {
                onCapture(imageSrc)
              } else {
                throw new Error('Failed to capture image')
              }
            } catch (err) {
              setError(t('camera.error'))
              setIsStarted(false)
            }
            return null
          }
          return prev ? prev - 1 : null
        })
      }, 1000)
    } catch (err) {
      setError(t('camera.error'))
      setIsStarted(false)
    }
  }, [onCapture, t])

  if (error) {
    return (
      <div className="text-center space-y-4">
        <p className="text-destructive">{error}</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setError(null)}
          className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold"
        >
          {t('buttons.tryAgain')}
        </motion.button>
      </div>
    )
  }

  return (
    <div className="relative w-full max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {!isStarted ? (
          <motion.div
            key="start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startCamera}
              className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? '🎬 Processing...' : '📸 Strike a Pose!'}
            </motion.button>
            <p className="text-sm text-muted-foreground">
              Get ready for your close-up! 🌟
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="camera"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full aspect-[4/3] object-cover"
                onUserMediaError={() => {
                  setError(t('camera.error'))
                  setIsStarted(false)
                }}
              />
              {/* Face guide overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-[20%] border-4 border-dashed border-white/30 rounded-full" />
              </div>
              {/* Countdown overlay */}
              {countdown && (
                <motion.div
                  key={countdown}
                  initial={{ scale: 2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <span className="text-6xl font-bold text-white drop-shadow-lg">
                    {countdown}
                  </span>
                </motion.div>
              )}
            </div>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Center your face in the circle and show us how you feel! 😊
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 