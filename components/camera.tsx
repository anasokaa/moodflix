'use client'

import { useRef, useCallback, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Camera as CameraIcon, Loader2 } from 'lucide-react'
import * as faceapi from 'face-api.js'

interface CameraProps {
  onCapture: (imageData: string, emotions: any) => void
  isLoading: boolean
}

export function Camera({ onCapture, isLoading }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load face-api models
  const loadModels = useCallback(async () => {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models')
      ])
      return true
    } catch (err) {
      console.error('Error loading models:', err)
      setError('Failed to load face detection models')
      return false
    }
  }, [])

  // Initialize camera
  const initializeCamera = useCallback(async () => {
    try {
      if (!videoRef.current) return
      
      const modelsLoaded = await loadModels()
      if (!modelsLoaded) return

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      })

      videoRef.current.srcObject = stream
      streamRef.current = stream
      setIsCameraReady(true)
      setError(null)
    } catch (err) {
      console.error('Error accessing camera:', err)
      setError('Unable to access camera')
      setIsCameraReady(false)
    }
  }, [loadModels])

  // Cleanup function
  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsCameraReady(false)
  }, [])

  // Initialize on mount
  useEffect(() => {
    initializeCamera()
    return cleanup
  }, [initializeCamera, cleanup])

  // Handle capture
  const handleCapture = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isLoading) return

    try {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      if (!context) return

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Detect face and emotions
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions()

      if (!detection) {
        setError('No face detected. Please ensure your face is clearly visible.')
        return
      }

      // Get image data
      const imageData = canvas.toDataURL('image/jpeg')

      // Extract emotions
      const emotions = detection.expressions

      // Call onCapture with image and emotions
      onCapture(imageData, emotions)
    } catch (err) {
      console.error('Error capturing image:', err)
      setError('Failed to capture and analyze image')
    }
  }, [onCapture, isLoading])

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video bg-muted">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          onLoadedMetadata={() => setIsCameraReady(true)}
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <p className="text-destructive text-center p-4">{error}</p>
          </div>
        )}
        
        {!isCameraReady && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        )}
      </div>

      <div className="p-4 flex justify-center">
        <Button
          size="lg"
          onClick={handleCapture}
          disabled={!isCameraReady || isLoading}
          className="w-full max-w-xs"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <CameraIcon className="w-4 h-4 mr-2" />
          )}
          Take a Selfie
        </Button>
      </div>
    </Card>
  )
} 