'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AnimatedContainerProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  whileHover?: boolean
  whileTap?: boolean
}

export function AnimatedContainer({
  children,
  className,
  onClick,
  whileHover = true,
  whileTap = true,
}: AnimatedContainerProps) {
  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-xl bg-card p-4 shadow-lg transition-colors',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={whileHover ? { scale: 1.02, y: -2 } : undefined}
      whileTap={whileTap ? { scale: 0.98 } : undefined}
      onClick={onClick}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
      }}
    >
      {children}
    </motion.div>
  )
} 