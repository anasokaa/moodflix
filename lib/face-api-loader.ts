import * as faceapi from 'face-api.js'

let modelsLoaded = false

export async function loadModels() {
  if (modelsLoaded) return

  try {
    await Promise.all([
      faceapi.nets.faceExpressionNet.loadFromUri('/models'),
      faceapi.nets.tinyFaceDetector.loadFromUri('/models')
    ])
    modelsLoaded = true
  } catch (error) {
    console.error('Error loading face-api.js models:', error)
    throw error
  }
} 