'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'

export type EmotionKey = 'happy' | 'sad' | 'angry' | 'fearful' | 'disgusted' | 'surprised' | 'neutral'
export type EmotionData = Record<EmotionKey, number>

interface UseFaceDetectionProps {
  videoElement: HTMLVideoElement | null
  isEnabled: boolean
  onError?: (error: string) => void
}

interface UseFaceDetectionResult {
  currentEmotion: EmotionKey
  emotionIntensity: number
  isModelReady: boolean
  detectEmotions: () => Promise<EmotionData | null>
}

let faceapi: typeof import('face-api.js') | null = null

export function useFaceDetection({
  videoElement,
  isEnabled,
  onError
}: UseFaceDetectionProps): UseFaceDetectionResult {
  const [isModelReady, setIsModelReady] = useState(false)
  const [currentEmotion, setCurrentEmotion] = useState<EmotionKey>('neutral')
  const [emotionIntensity, setEmotionIntensity] = useState(0.5)

  const loadFaceApi = useCallback(async () => {
    if (typeof window === 'undefined') return false
    if (faceapi) return true

    try {
      faceapi = await import('face-api.js')
      return true
    } catch (err) {
      console.error('Failed to load face-api.js:', err)
      onError?.('Failed to initialize face detection')
      return false
    }
  }, [onError])

  const loadModels = useCallback(async () => {
    if (!await loadFaceApi()) return false

    try {
      await Promise.all([
        faceapi!.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi!.nets.faceExpressionNet.loadFromUri('/models')
      ])
      setIsModelReady(true)
      return true
    } catch (err) {
      onError?.('Failed to load face detection models')
      return false
    }
  }, [loadFaceApi, onError])

  useEffect(() => {
    if (!isModelReady) {
      loadModels()
    }
  }, [isModelReady, loadModels])

  const detectEmotions = useCallback(async () => {
    if (!videoElement || !isEnabled || !isModelReady || !faceapi) return null

    try {
      const detection = await faceapi
        .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions()

      if (!detection) {
        onError?.('No face detected')
        return null
      }

      const emotions: EmotionData = {
        happy: detection.expressions.happy,
        sad: detection.expressions.sad,
        angry: detection.expressions.angry,
        fearful: detection.expressions.fearful,
        disgusted: detection.expressions.disgusted,
        surprised: detection.expressions.surprised,
        neutral: detection.expressions.neutral
      }

      const entries = Object.entries(emotions) as [EmotionKey, number][]
      const [dominantEmotion, intensity] = entries.reduce((a, b) => 
        a[1] > b[1] ? a : b
      )

      setCurrentEmotion(dominantEmotion)
      setEmotionIntensity(intensity)

      return emotions
    } catch (err) {
      onError?.('Failed to analyze emotions')
      return null
    }
  }, [videoElement, isEnabled, isModelReady, onError])

  return {
    currentEmotion,
    emotionIntensity,
    isModelReady,
    detectEmotions
  }
} 
} 