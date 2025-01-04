'use client'

import { useRef, useState, useCallback } from 'react'
import { useLanguage } from '@/lib/language-context'
import { motion } from 'framer-motion'
import { Camera as CameraIcon } from 'lucide-react'

export function Camera({ onCapture, isLoading }: { onCapture: (imageData: string) => void, isLoading: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isActive, setIsActive] = useState(false)
  const { t } = useLanguage()

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
        setIsActive(true)
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
    }
  }, [])

  const captureImage = useCallback(() => {
    if (!videoRef.current) return

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Flip horizontally to mirror the image
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    
    ctx.drawImage(videoRef.current, 0, 0)
    const imageData = canvas.toDataURL('image/jpeg', 0.8)

    // Stop the camera stream
    const stream = videoRef.current.srcObject as MediaStream
    stream?.getTracks().forEach(track => track.stop())
    setIsActive(false)
    
    onCapture(imageData)
  }, [onCapture])

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Camera UI */}
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/10 backdrop-blur-sm border-2 border-primary/20">
        {isActive ? (
          <>
            {/* Video feed with mirror effect */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover transform scale-x-[-1]"
            />
            
            {/* Face guide overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border-2 border-dashed border-white/30 rounded-full" />
            </div>
            
            {/* Capture button */}
            <motion.button
              onClick={captureImage}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground rounded-full p-4 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isLoading}
            >
              <CameraIcon className="w-8 h-8" />
            </motion.button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            {isLoading ? (
              <motion.div
                className="flex flex-col items-center gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-lg font-medium text-primary">{t('camera.analyzing')}</p>
              </motion.div>
            ) : (
              <motion.button
                onClick={startCamera}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <CameraIcon className="w-5 h-5" />
                {t('camera.start')}
              </motion.button>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 