'use client'

import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Smile, Frown, Meh, Angry, Skull, Heart } from 'lucide-react'

interface EmotionDisplayProps {
  emotions?: Record<string, number>
  emotion?: string
}

const emotionIcons = {
  happy: Smile,
  sad: Frown,
  neutral: Meh,
  angry: Angry,
  fearful: Skull,
  surprised: Heart
}

export function EmotionDisplay({ emotions, emotion }: EmotionDisplayProps) {
  const dominantEmotion = useMemo(() => {
    if (emotion) return emotion

    if (emotions) {
      const [dominant] = Object.entries(emotions)
        .sort(([, a], [, b]) => b - a)[0]
      
      return dominant.toLowerCase()
    }

    return 'neutral'
  }, [emotions, emotion])

  const Icon = emotionIcons[dominantEmotion as keyof typeof emotionIcons] || Meh

  return (
    <Card className="p-4 inline-flex items-center gap-2 bg-primary/10">
      <Icon className="w-5 h-5 text-primary" />
      <span className="font-medium capitalize">
        {dominantEmotion} mood
      </span>
    </Card>
  )
} 