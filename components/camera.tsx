'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { useLanguage } from '@/lib/language-context'
import { motion } from 'framer-motion'
import { Camera as CameraIcon } from 'lucide-react'

export function Camera({ onCapture, isLoading }: { onCapture: (imageData: string) => void, isLoading: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState<string>()
  const { t } = useLanguage()
  const [isInitializing, setIsInitializing] = useState(false)

  // Clean up function to stop all tracks
  const stopAllTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }, [])

  const startCamera = useCallback(async () => {
    try {
      setIsInitializing(true)
      console.log('Starting camera initialization...')
      // First, clean up any existing streams
      stopAllTracks()
      setError(undefined)
      setIsActive(false)

      console.log('Requesting camera access...')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      })
      
      console.log('Camera access granted, setting up video stream...')
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded')
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => {
                console.log('Video playback started successfully')
                setIsActive(true)
              })
              .catch((playError) => {
                console.error('Error playing video:', playError)
                throw playError
              })
          }
        }
      } else {
        console.error('Video ref is null')
        throw new Error('Video element not found')
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          setError(t('camera.permission'))
        } else if (err.name === 'NotReadableError') {
          setError(t('camera.inUse'))
        } else if (err.name === 'NotFoundError') {
          setError(t('camera.notFound'))
        } else {
          setError(t('camera.error'))
        }
      } else {
        setError(t('camera.error'))
      }
      stopAllTracks()
    } finally {
      setIsInitializing(false)
    }
  }, [t, stopAllTracks])

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
      stopAllTracks()
      setIsActive(false)
      
      onCapture(imageData)
    } catch (err) {
      console.error('Error capturing image:', err)
      setError(t('camera.error'))
    }
  }, [onCapture, t, stopAllTracks])

  // Clean up camera stream when component unmounts
  useEffect(() => {
    return stopAllTracks
  }, [stopAllTracks])

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
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-primary/10">
        {isActive && (
          <div className="absolute inset-0">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
            />
          </div>
        )}
        
        {isActive && (
          <>
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
        )}

        {!isActive && (
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
            ) : isInitializing ? (
              <motion.div
                className="flex flex-col items-center gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-lg font-medium text-primary">Initializing camera...</p>
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
      
      {/* Debug info */}
      <div className="mt-4 text-sm text-primary/60">
        <p>Camera status: {isActive ? 'Active' : 'Inactive'}</p>
        <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
        <p>Initializing: {isInitializing ? 'Yes' : 'No'}</p>
        {error && <p className="text-destructive">Error: {error}</p>}
      </div>
    </div>
  )
} 