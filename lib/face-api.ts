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
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      throw new Error('Face detection is only available in browser environment')
    }

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

    // Create a canvas element (required for face-api.js)
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Could not get canvas context')
    }
    ctx.drawImage(img, 0, 0)

    // Detect faces and expressions
    const detections = await faceapi
      .detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions())
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