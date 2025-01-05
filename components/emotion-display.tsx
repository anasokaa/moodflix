import { Card, CardContent } from "@/components/ui/card"
import { Smile, Frown, Angry, Meh, Ghost, Heart, Dizzy } from 'lucide-react'

const emotionIcons = {
  happiness: { icon: Heart, label: "Happy" },
  sadness: { icon: Frown, label: "Sad" },
  anger: { icon: Angry, label: "Angry" },
  surprise: { icon: Dizzy, label: "Surprised" },
  neutral: { icon: Meh, label: "Neutral" },
  fear: { icon: Ghost, label: "Fearful" },
  disgust: { icon: Angry, label: "Disgusted" }
}

interface EmotionDisplayProps {
  emotion: string
}

export function EmotionDisplay({ emotion }: EmotionDisplayProps) {
  const emotionData = emotionIcons[emotion.toLowerCase() as keyof typeof emotionIcons] || emotionIcons.neutral
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