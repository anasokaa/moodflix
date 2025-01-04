'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { useLanguage } from '@/lib/language-context'
import { Button } from '@/components/ui/button'
import { Camera as CameraIcon, Aperture, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface CameraProps {
  onCapture: (imageData: string) => void
}

export function Camera({ onCapture }: CameraProps) {
  const { t } = useLanguage()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCountingDown, setIsCountingDown] = useState(false)
  const [countdown, setCountdown] = useState(3)

  // Cleanup function
  const stopStream = useCallback(() => {
    try {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
        videoRef.current.srcObject = null
      }
      setIsStreaming(false)
    } catch (err) {
      console.error('Error stopping stream:', err)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStream()
    }
  }, [stopStream])

  const startCamera = useCallback(async () => {
    try {
      // Stop any existing stream
      stopStream()

      // Create video element if it doesn't exist
      if (!videoRef.current) {
        console.error('Video element not found')
        setError('Camera initialization failed')
        return
      }

      console.log('Requesting camera access...')
      const constraints = {
        video: true, // Simplified constraints
        audio: false
      }
      console.log('Using constraints:', constraints)

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      console.log('Camera access granted, tracks:', stream.getVideoTracks())

      // Set the stream to the video element
      videoRef.current.srcObject = stream
      console.log('Set stream to video element')

      // Enable video mirroring
      videoRef.current.style.transform = 'scaleX(-1)'

      // Wait for video to be ready
      videoRef.current.onloadedmetadata = () => {
        console.log('Video metadata loaded')
        if (!videoRef.current) return

        // Ensure video element is visible
        videoRef.current.style.display = 'block'
        
        videoRef.current.play()
          .then(() => {
            console.log('Video playing successfully')
            setIsStreaming(true)
            setError(null)
          })
          .catch(err => {
            console.error('Error playing video:', err)
            setError('Failed to start video playback')
          })
      }

      // Add error handler for video element
      videoRef.current.onerror = (e) => {
        console.error('Video element error:', e)
        setError('Video element encountered an error')
      }

    } catch (err) {
      console.error('Camera access error:', err)
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          setError('Camera access denied. Please allow camera access and try again.')
        } else if (err.name === 'NotFoundError') {
          setError('No camera found. Please connect a camera and try again.')
        } else {
          setError(`Camera error: ${err.message}`)
        }
      } else {
        setError('Failed to start camera')
      }
    }
  }, [stopStream])

  const captureImage = useCallback(() => {
    if (!videoRef.current) {
      console.error('Video element not found during capture')
      setError('Failed to capture image: video element not found')
      return
    }

    try {
      // Start countdown
      setIsCountingDown(true)
      setCountdown(3)

      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval)
            setIsCountingDown(false)
            // Take the actual photo
            const canvas = document.createElement('canvas')
            canvas.width = videoRef.current!.videoWidth
            canvas.height = videoRef.current!.videoHeight

            const ctx = canvas.getContext('2d')
            if (!ctx) {
              throw new Error('Failed to get canvas context')
            }

            // Mirror the image if the video is mirrored
            ctx.scale(-1, 1)
            ctx.translate(-canvas.width, 0)
            ctx.drawImage(videoRef.current!, 0, 0)

            const imageData = canvas.toDataURL('image/jpeg', 0.8)
            onCapture(imageData)
            stopStream()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (err) {
      console.error('Capture error:', err)
      setError('Failed to capture image: ' + (err instanceof Error ? err.message : 'unknown error'))
      setIsCountingDown(false)
    }
  }, [onCapture, stopStream])

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />
        
        {/* Face guide overlay */}
        {isStreaming && !isCountingDown && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              className="w-48 h-48 rounded-full border-2 border-primary/50 border-dashed"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          </div>
        )}

        {/* Countdown overlay */}
        <AnimatePresence>
          {isCountingDown && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                key={countdown}
                className="text-6xl font-bold text-white"
                initial={{ scale: 2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
              >
                {countdown}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="absolute inset-0 flex items-center justify-center">
          {error ? (
            <div className="text-center p-6 bg-background/80 backdrop-blur-sm rounded-lg max-w-md">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={startCamera} variant="secondary" size="lg" className="gap-2">
                <RefreshCw className="w-5 h-5" />
                {t('camera.tryAgain')}
              </Button>
            </div>
          ) : !isStreaming ? (
            <Button 
              onClick={startCamera} 
              size="lg"
              className="text-lg gap-2 bg-primary/90 hover:bg-primary/100 shadow-lg"
            >
              <CameraIcon className="w-6 h-6" />
              {t('camera.letMeSeeYourSmile')}
            </Button>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Button 
                  onClick={captureImage}
                  size="lg"
                  variant="secondary"
                  className="text-lg gap-2 bg-background/80 backdrop-blur-sm hover:bg-background/90 shadow-lg"
                  disabled={isCountingDown}
                >
                  <Aperture className="w-6 h-6" />
                  {t('camera.captureTheMoment')}
                </Button>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  )
} 