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

  const formData = new FormData()
  formData.append('api_key', apiKey)
  formData.append('api_secret', apiSecret)
  formData.append('image_base64', imageData)
  formData.append('return_attributes', 'emotion')

  try {
    console.log('Sending request to Face++ API...')
    const response = await fetch('https://api-us.faceplusplus.com/facepp/v3/detect', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()
    console.log('Face++ API response:', data)

    if (!response.ok) {
      console.error('Face++ API error:', data.error_message)
      throw new Error(data.error_message || 'Failed to analyze face')
    }

    if (!data.faces || data.faces.length === 0) {
      console.log('No faces detected in the image')
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

    console.log('Normalized emotions:', normalizedEmotions)
    return { emotion: normalizedEmotions }
  } catch (error) {
    console.error('Error in face analysis:', error)
    throw error
  }
} 