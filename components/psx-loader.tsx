'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PSXLogo } from './psx-logo'

export function PSXLoader() {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setShow(false), 1400)
    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
        >
          <div className="flex flex-col items-center gap-4">
            <PSXLogo size={120} />
            <motion.div
              className="h-1 w-32 rounded-full bg-gradient-to-r from-primary to-secondary"
              animate={{ scaleX: [0.3, 1, 0.6, 1] }}
              transition={{ repeat: Infinity, duration: 1.4 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
