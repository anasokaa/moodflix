'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface EmotionColors {
  happiness: string
  sadness: string
  anger: string
  fear: string
  disgust: string
  surprise: string
  neutral: string
}

const emotionColors: EmotionColors = {
  happiness: '#FFD700', // Gold
  sadness: '#4169E1', // Royal Blue
  anger: '#FF4500', // Red Orange
  fear: '#800080', // Purple
  disgust: '#32CD32', // Lime Green
  surprise: '#FF69B4', // Hot Pink
  neutral: '#FFFFFF', // White
}

interface MoodRingProps {
  dominantEmotion?: keyof EmotionColors
  intensity?: number
}

export function MoodRing({ dominantEmotion = 'neutral', intensity = 0.5 }: MoodRingProps) {
  const [gradientColors, setGradientColors] = useState<string[]>([])
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    // Create a dynamic gradient based on the dominant emotion
    const mainColor = emotionColors[dominantEmotion]
    const colors = [
      mainColor,
      adjustColor(mainColor, 30),
      adjustColor(mainColor, 60),
      adjustColor(mainColor, 90),
      mainColor,
    ]
    setGradientColors(colors)

    // Animate rotation
    const interval = setInterval(() => {
      setRotation(prev => (prev + 1) % 360)
    }, 50)

    return () => clearInterval(interval)
  }, [dominantEmotion])

  // Helper function to adjust color hue
  function adjustColor(hex: string, degree: number): string {
    const rgb = hexToRgb(hex)
    if (!rgb) return hex
    
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
    const newHue = (hsl[0] + degree) % 360
    const newRgb = hslToRgb(newHue, hsl[1], hsl[2])
    
    return rgbToHex(newRgb[0], newRgb[1], newRgb[2])
  }

  // Color conversion utilities
  function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  function rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }).join('')
  }

  function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s
    const l = (max + min) / 2

    if (max === min) {
      h = s = 0
    } else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }

      h /= 6
    }

    return [h * 360, s, l]
  }

  function hslToRgb(h: number, s: number, l: number): [number, number, number] {
    let r, g, b

    if (s === 0) {
      r = g = b = l
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1/6) return p + (q - p) * 6 * t
        if (t < 1/2) return q
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
        return p
      }

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s
      const p = 2 * l - q

      r = hue2rgb(p, q, h / 360 + 1/3)
      g = hue2rgb(p, q, h / 360)
      b = hue2rgb(p, q, h / 360 - 1/3)
    }

    return [
      Math.round(r * 255),
      Math.round(g * 255),
      Math.round(b * 255)
    ]
  }

  const gradientStyle = {
    background: `conic-gradient(from ${rotation}deg, ${gradientColors.join(', ')})`,
    opacity: 0.3 + (intensity * 0.7), // Adjust opacity based on emotion intensity
  }

  return (
    <motion.div
      className="absolute inset-0 rounded-lg"
      style={gradientStyle}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    />
  )
} 