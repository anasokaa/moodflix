import { Card, CardContent } from "@/components/ui/card"
import { Smile, Frown, Angry, Meh, AlertCircle, Heart, Dizzy } from 'lucide-react'

const emotionIcons = {
  // Face++ API emotions
  happiness: { icon: Smile, label: "Happy" },
  sadness: { icon: Frown, label: "Sad" },
  anger: { icon: Angry, label: "Angry" },
  surprise: { icon: AlertCircle, label: "Surprised" },
  neutral: { icon: Meh, label: "Neutral" },
  fear: { icon: Dizzy, label: "Fearful" },
  disgust: { icon: Angry, label: "Disgusted" },
  
  // Alternative spellings and variations
  happy: { icon: Smile, label: "Happy" },
  sad: { icon: Frown, label: "Sad" },
  angry: { icon: Angry, label: "Angry" },
  surprised: { icon: AlertCircle, label: "Surprised" },
  fearful: { icon: Dizzy, label: "Fearful" },
  disgusted: { icon: Angry, label: "Disgusted" }
}

interface EmotionDisplayProps {
  emotion: string
}

export function EmotionDisplay({ emotion }: EmotionDisplayProps) {
  // Normalize the emotion string
  const normalizedEmotion = emotion.toLowerCase().trim()
  
  // Get the emotion data or fallback to neutral
  const emotionData = emotionIcons[normalizedEmotion as keyof typeof emotionIcons] || emotionIcons.neutral
  const Icon = emotionData.icon

  return (
    <Card className="bg-primary/5 border-none">
      <CardContent className="flex items-center justify-center gap-4 p-6">
        <Icon className="w-8 h-8 text-primary" />
        <div className="text-center">
          <h3 className="text-xl font-semibold capitalize">
            {emotionData.label} Mood
          </h3>
          <p className="text-sm text-muted-foreground">
            Here's a movie that matches your current mood
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 