'use client'

import dynamic from 'next/dynamic'

const CameraCapture = dynamic(
  () => import('@/components/camera-capture'),
  { ssr: false }
)

export function ClientCameraWrapper() {
  const handleCapture = (imageData: string) => {
    // Handle the captured image data
    console.log('Image captured:', imageData)
  }

  return (
    <div suppressHydrationWarning>
      <CameraCapture onCapture={handleCapture} />
    </div>
  )
} 