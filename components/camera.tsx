'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/language-context'
import { Camera as CameraIcon } from 'lucide-react'
import { analyzeImage } from '@/lib/face-api'
import { loadModels } from '@/lib/face-api-loader'

interface CameraProps {
  onCapture: (imageData: string, emotions: any) => void
  isLoading: boolean
}

export function Camera({ onCapture, isLoading }: CameraProps) {
  const [cameraActive, setCameraActive] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const { t } = useLanguage()

  const startCamera = useCallback(async () => {
    try {
      setError(null)
      setIsInitializing(true)

      // Load face-api.js models
      await loadModels()

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setCameraActive(true)
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      setError(t('camera.error'))
    } finally {
      setIsInitializing(false)
    }
  }, [t])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
  }, [])

  const handleCapture = useCallback(async () => {
    if (!videoRef.current) return

    try {
      setError(null)
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Could not get canvas context')

      // Flip the image horizontally to match the mirrored preview
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
      ctx.drawImage(videoRef.current, 0, 0)

      const imageData = canvas.toDataURL('image/jpeg')
      setCapturedImage(imageData)
      stopCamera()

      // Analyze the image for emotions
      const emotions = await analyzeImage(imageData)
      
      // Pass both the image and emotions to the parent
      onCapture(imageData, emotions)
    } catch (err) {
      console.error('Error capturing image:', err)
      setError(t('camera.error'))
    }
  }, [onCapture, stopCamera, t])

  const handleRetry = useCallback(() => {
    setCapturedImage(null)
    startCamera()
  }, [startCamera])

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  return (
    <div className="space-y-4">
      <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
        {!capturedImage ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onCanPlay={() => videoRef.current?.play()}
            className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
          />
        ) : (
          <img
            src={capturedImage}
            alt="Captured"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        <div className="absolute inset-0 flex items-center justify-center">
          {!cameraActive && !capturedImage && (
            <Button
              onClick={startCamera}
              disabled={isLoading || isInitializing}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                t('loading.camera')
              ) : isInitializing ? (
                'Initializing...'
              ) : (
                <>
                  <CameraIcon className="w-4 h-4" />
                  {t('camera.start')}
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {cameraActive && !capturedImage && (
        <div className="flex justify-center">
          <Button onClick={handleCapture} className="w-full max-w-sm">
            {t('camera.capture')}
          </Button>
        </div>
      )}

      {capturedImage && !isLoading && (
        <div className="flex justify-center gap-4">
          <Button onClick={handleRetry} variant="outline">
            {t('camera.retake')}
          </Button>
        </div>
      )}

      {error && (
        <div className="text-center text-destructive">
          {error}
        </div>
      )}
    </div>
  )
} 