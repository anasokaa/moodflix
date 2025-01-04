'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { useLanguage } from '@/lib/language-context'
import { motion } from 'framer-motion'
import { Camera as CameraIcon } from 'lucide-react'

export function Camera({ onCapture, isLoading }: { onCapture: (imageData: string) => void, isLoading: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState<string>()
  const { t } = useLanguage()

  const startCamera = useCallback(async () => {
    try {
      setError(undefined)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => setIsActive(true))
              .catch((err) => {
                console.error('Error playing video:', err)
                setError(t('camera.error'))
              })
          }
        }
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      setError(t('camera.error'))
    }
  }, [t])

  const captureImage = useCallback(() => {
    if (!videoRef.current) return

    try {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('Could not get canvas context')
      }
      
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
    } catch (err) {
      console.error('Error capturing image:', err)
      setError(t('camera.error'))
    }
  }, [onCapture, t])

  // Clean up camera stream when component unmounts
  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  if (error) {
    return (
      <div className="w-full max-w-md mx-auto p-6 text-center space-y-4">
        <p className="text-lg text-destructive">{error}</p>
        <motion.button
          onClick={() => {
            setError(undefined)
            startCamera()
          }}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {t('camera.retake')}
        </motion.button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/10 backdrop-blur-sm border border-primary/10">
        {isActive ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted // Add muted to ensure autoplay works
              className="w-full h-full object-cover transform scale-x-[-1]"
            />
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div 
                className="w-64 h-64 border-2 border-dashed border-white/30 rounded-full"
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
            
            <motion.button
              onClick={captureImage}
              className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground rounded-full p-4 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isLoading}
            >
              <CameraIcon className="w-8 h-8" />
            </motion.button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-6">
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
                className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-medium text-lg shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <CameraIcon className="w-6 h-6" />
                {t('camera.start')}
              </motion.button>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 