export interface Emotions {
  angry: number
  disgusted: number
  fearful: number
  happy: number
  neutral: number
  sad: number
  surprised: number
}

import * as tf from '@tensorflow/tfjs'
import * as blazeface from '@tensorflow-models/blazeface'
import * as faceapi from '@tensorflow-models/face-detection'

let blazefaceModel: blazeface.BlazeFaceModel | null = null
let faceModel: faceapi.FaceDetector | null = null

export async function loadModels() {
  if (!blazefaceModel) {
    blazefaceModel = await blazeface.load()
  }
  if (!faceModel) {
    faceModel = await faceapi.createDetector(faceapi.SupportedModels.MediaPipeFaceDetector)
  }
  return { blazefaceModel, faceModel }
}

export async function detectEmotion(imageElement: HTMLImageElement) {
  try {
    const { blazefaceModel, faceModel } = await loadModels()
    if (!blazefaceModel || !faceModel) throw new Error('Models not loaded')

    // Detect face
    const faces = await blazefaceModel.estimateFaces(imageElement, false)
    if (faces.length === 0) throw new Error('No face detected')

    // For now, return a neutral emotion since we don't have emotion detection
    return {
      angry: 0,
      disgusted: 0,
      fearful: 0,
      happy: 1,
      neutral: 0,
      sad: 0,
      surprised: 0
    } as Emotions
  } catch (error) {
    console.error('Error detecting emotion:', error)
    throw error
  }
} 