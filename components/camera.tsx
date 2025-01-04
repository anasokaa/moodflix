'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { useLanguage } from '@/lib/language-context'
import { Button } from '@/components/ui/button'
import { Camera as CameraIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface CameraProps {
  onCapture: (imageData: string) => void
}

export function Camera({ onCapture }: CameraProps) {
  const { t } = useLanguage()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isStarted, setIsStarted] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsStarted(true)
        // Start countdown immediately when camera starts
        setCountdown(3)
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      setError(t('camera.error'))
    }
  }, [t])

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
      setIsStarted(false)
    }
  }, [])

  const captureImage = useCallback(() => {
    if (!videoRef.current) return

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Flip the image horizontally to mirror it
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    
    ctx.drawImage(videoRef.current, 0, 0)
    const imageData = canvas.toDataURL('image/jpeg')
    
    onCapture(imageData)
    stopCamera()
  }, [onCapture, stopCamera])

  useEffect(() => {
    if (countdown === null) return

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      captureImage()
    }
  }, [countdown, captureImage])

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-destructive text-lg">{error}</p>
        <Button onClick={() => setError(null)}>{t('buttons.tryAgain')}</Button>
      </div>
    )
  }

  return (
    <div className="relative flex flex-col items-center justify-center gap-8">
      <div className="relative w-full max-w-2xl aspect-video rounded-lg overflow-hidden bg-muted">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover mirror"
        />
        
        {!isStarted && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <Button
              size="lg"
              onClick={startCamera}
              className="gap-2"
            >
              <CameraIcon className="w-5 h-5" />
              {t('camera.start')}
            </Button>
          </div>
        )}

        <AnimatePresence>
          {countdown !== null && countdown > 0 && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <span className="text-8xl font-bold text-primary drop-shadow-lg">
                {countdown}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-muted-foreground text-center max-w-md">
        {t('camera.instructions')}
      </p>
    </div>
  )
} 