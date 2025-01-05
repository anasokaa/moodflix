declare module 'face-api.js' {
  export interface FaceDetection {
    detection: any
    expressions: FaceExpressions
  }

  export interface FaceExpressions {
    happy: number
    sad: number
    angry: number
    fearful: number
    disgusted: number
    surprised: number
    neutral: number
  }

  export class TinyFaceDetectorOptions {
    constructor()
  }

  export const nets: {
    tinyFaceDetector: {
      loadFromUri: (path: string) => Promise<void>
    }
    faceExpressionNet: {
      loadFromUri: (path: string) => Promise<void>
    }
  }

  export function detectSingleFace(
    input: HTMLVideoElement | HTMLCanvasElement,
    options: TinyFaceDetectorOptions
  ): Promise<FaceDetection | undefined> & {
    withFaceExpressions(): Promise<FaceDetection | undefined>
  }
} 