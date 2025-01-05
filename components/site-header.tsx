'use client'

import Link from 'next/link'
import { LanguageSwitcher } from '@/components/language-switcher'
import { motion } from 'framer-motion'

export function SiteHeader() {
  return (
    <header className="w-full py-4">
      <div className="container flex items-center justify-between max-w-4xl mx-auto">
        <Link href="/">
          <motion.h1
            className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 hover:opacity-80 transition-opacity"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            MoodFlix ✨
          </motion.h1>
        </Link>
        <LanguageSwitcher />
      </div>
    </header>
  )
} 