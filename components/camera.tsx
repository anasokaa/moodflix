'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { useLanguage } from '@/lib/language-context'
import { Button } from '@/components/ui/button'
import { Camera as CameraIcon, Aperture } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface CameraProps {
  onCapture: (imageData: string) => void
}

export function Camera({ onCapture }: CameraProps) {
  const { t } = useLanguage()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    console.log('Attempting to capture image...')
    
    if (!videoRef.current) {
      console.error('Video element not found during capture')
      setError('Failed to capture image: video element not found')
      return
    }

    try {
      // Wait for video to be ready
      if (!videoRef.current.videoWidth || !videoRef.current.videoHeight) {
        console.error('Video dimensions not available')
        setError('Failed to capture image: video not ready')
        return
      }

      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      console.log('Canvas dimensions:', canvas.width, 'x', canvas.height)

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        console.error('Failed to get canvas context')
        setError('Failed to capture image: canvas context not available')
        return
      }

      // Mirror the image if the video is mirrored
      ctx.scale(-1, 1)
      ctx.translate(-canvas.width, 0)
      
      ctx.drawImage(videoRef.current, 0, 0)
      console.log('Image drawn to canvas')

      const imageData = canvas.toDataURL('image/jpeg', 0.8)
      console.log('Image converted to data URL')
      
      console.log('Calling onCapture with image data...')
      onCapture(imageData)
      console.log('Image capture complete')
      
      stopStream()
    } catch (err) {
      console.error('Capture error:', err)
      setError('Failed to capture image: ' + (err instanceof Error ? err.message : 'unknown error'))
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
        
        <div className="absolute inset-0 flex items-center justify-center">
          {error ? (
            <div className="text-center p-4 bg-background/80 backdrop-blur-sm rounded-lg">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={startCamera} variant="secondary">
                <CameraIcon className="mr-2 h-4 w-4" />
                {t('camera.tryAgain')}
              </Button>
            </div>
          ) : !isStreaming ? (
            <Button 
              onClick={startCamera} 
              size="lg"
              className="text-lg"
            >
              <CameraIcon className="mr-2 h-5 w-5" />
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
                  className="text-lg bg-background/80 backdrop-blur-sm hover:bg-background/90"
                >
                  <Aperture className="mr-2 h-5 w-5" />
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