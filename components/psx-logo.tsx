'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

export function PSXLogo({ size = 40 }: { size?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      whileHover={{ scale: 1.04, rotate: [0, 2, -1, 0] }}
      className="flex items-center"
    >
      <div style={{ width: size, height: size }} className="relative">
        <Image src="/psx-logo.svg" alt="PSX" fill sizes={`${size}px`} style={{ objectFit: 'contain' }} />
      </div>
    </motion.div>
  )
}
