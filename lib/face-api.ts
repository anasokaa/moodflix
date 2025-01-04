interface EmotionData {
  anger: number
  disgust: number
  fear: number
  happiness: number
  neutral: number
  sadness: number
  surprise: number
}

interface FaceAttributes {
  emotion: EmotionData
}

export async function analyzeFace(base64Image: string): Promise<FaceAttributes | null> {
  const apiKey = process.env.FACE_API_KEY
  const apiSecret = process.env.FACE_API_SECRET

  if (!apiKey || !apiSecret) {
    throw new Error('Face API credentials not configured')
  }

  // Remove data:image/jpeg;base64, prefix if it exists
  const imageData = base64Image.includes('base64,') 
    ? base64Image.split('base64,')[1]
    : base64Image

  try {
    console.log('Face API: Preparing request...')
    const params = new URLSearchParams()
    params.append('api_key', apiKey)
    params.append('api_secret', apiSecret)
    params.append('image_base64', imageData)
    params.append('return_attributes', 'emotion')

    console.log('Face API: Sending request...')
    const response = await fetch('https://api-us.faceplusplus.com/facepp/v3/detect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    const data = await response.json()
    console.log('Face API: Response status:', response.status)
    console.log('Face API: Response data:', JSON.stringify(data, null, 2))

    if (!response.ok) {
      console.error('Face API: Error response:', data.error_message)
      throw new Error(data.error_message || 'Failed to analyze face')
    }

    if (!data.faces || data.faces.length === 0) {
      console.log('Face API: No faces detected')
      return null
    }

    // Normalize emotion values to sum to 1
    const emotions = data.faces[0].attributes.emotion
    const emotionValues = Object.values(emotions) as number[]
    const total = emotionValues.reduce((sum, value) => sum + value, 0)
    
    const normalizedEmotions = Object.entries(emotions).reduce((acc, [key, value]) => {
      acc[key as keyof EmotionData] = (value as number) / total
      return acc
    }, {} as EmotionData)

    console.log('Face API: Normalized emotions:', normalizedEmotions)
    return { emotion: normalizedEmotions }
  } catch (error) {
    console.error('Face API: Error:', error)
    throw error
  }
} 