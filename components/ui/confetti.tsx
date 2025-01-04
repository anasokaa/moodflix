'use client'

import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'

interface ConfettiProps {
  trigger: boolean
}

export function Confetti({ trigger }: ConfettiProps) {
  useEffect(() => {
    if (trigger) {
      const duration = 3000
      const end = Date.now() + duration

      const colors = ['#ff718d', '#ff8c37', '#ffcd3c', '#6b7bff', '#45e3ff']

      ;(function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
        })
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
        })

        if (Date.now() < end) {
          requestAnimationFrame(frame)
        }
      })()
    }
  }, [trigger])

  return null
} 