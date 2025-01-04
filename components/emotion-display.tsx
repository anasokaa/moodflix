import { Card, CardContent } from "@/components/ui/card"
import { Smile, Frown, Angry, AlertCircle, Meh, Ghost } from 'lucide-react'

const emotionIcons = {
  happy: Smile,
  sad: Frown,
  angry: Angry,
  surprised: AlertCircle,
  neutral: Meh,
  fearful: Ghost
}

interface EmotionDisplayProps {
  emotion: string
}

export function EmotionDisplay({ emotion }: EmotionDisplayProps) {
  const Icon = emotionIcons[emotion as keyof typeof emotionIcons] || Meh

  return (
    <Card className="bg-primary/5 border-none">
      <CardContent className="flex items-center justify-center gap-4 p-6">
        <Icon className="w-8 h-8 text-primary" />
        <div className="text-center">
          <h3 className="text-xl font-semibold capitalize">
            {emotion} Mood
          </h3>
          <p className="text-sm text-muted-foreground">
            Here are some movies that match your current mood
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 