'use client'

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Camera } from 'lucide-react'
import { useLanguage } from "@/lib/language-context"

interface CameraCaptureProps {
  onCapture: (imageData: string) => void
}

export default function CameraCapture({ onCapture }: CameraCaptureProps) {
  const { t } = useLanguage()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Cleanup function to stop the camera when component unmounts
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const handleStartCamera = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraActive(true)
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      setError(t('camera.error'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleCapture = () => {
    if (!videoRef.current) return

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Flip the image horizontally if it was mirrored in the video
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    
    ctx.drawImage(videoRef.current, 0, 0)
    
    const imageData = canvas.toDataURL('image/jpeg')
    setCapturedImage(imageData)
    onCapture(imageData)

    // Stop the camera
    if (videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
      setCameraActive(false)
    }
  }

  const handleRetry = () => {
    setCapturedImage(null)
    handleStartCamera()
  }

  if (error) {
    return (
      <div className="text-center p-4 bg-red-500/10 rounded-lg">
        <p className="text-red-500">{error}</p>
        <Button onClick={handleStartCamera} className="mt-4">
          {t('camera.tryAgain')}
        </Button>
      </div>
    )
  }

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
              onClick={handleStartCamera}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                t('loading.camera')
              ) : (
                <>
                  <Camera className="w-4 h-4" />
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

      {capturedImage && (
        <div className="flex justify-center gap-4">
          <Button onClick={handleRetry} variant="outline">
            {t('camera.retake')}
          </Button>
        </div>
      )}
    </div>
  )
} 