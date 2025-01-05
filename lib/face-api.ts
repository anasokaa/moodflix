import * as faceapi from 'face-api.js'

interface EmotionData {
  anger: number
  disgust: number
  fear: number
  happiness: number
  neutral: number
  sadness: number
  surprise: number
}

export async function analyzeImage(imageData: string): Promise<EmotionData> {
  try {
    // Load models
    await faceapi.nets.faceExpressionNet.loadFromUri('/models')
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models')

    // Create an HTML image element
    const img = new Image()
    img.src = imageData

    // Wait for the image to load
    await new Promise((resolve) => {
      img.onload = resolve
    })

    // Detect faces and expressions
    const detections = await faceapi
      .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions()

    if (!detections) {
      throw new Error('No face detected')
    }

    // Map face-api.js expressions to our emotion format
    const emotions: EmotionData = {
      anger: detections.expressions.angry,
      disgust: detections.expressions.disgusted,
      fear: detections.expressions.fearful,
      happiness: detections.expressions.happy,
      neutral: detections.expressions.neutral,
      sadness: detections.expressions.sad,
      surprise: detections.expressions.surprised
    }

    return emotions
  } catch (error) {
    console.error('Face API error:', error)
    throw error
  }
} 