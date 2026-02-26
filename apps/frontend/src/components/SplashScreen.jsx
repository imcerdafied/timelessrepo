import { motion } from 'framer-motion'

export default function SplashScreen({ onComplete }) {
  return (
    <motion.div
      className="flex h-full flex-col items-center justify-center bg-background"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      onAnimationComplete={(def) => {
        // Only fire on exit animation
        if (def.opacity === 0) onComplete?.()
      }}
    >
      <motion.h1
        className="font-heading text-4xl font-bold tracking-[0.18em] text-present uppercase"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        Timeless
      </motion.h1>
      <motion.p
        className="mt-3 font-ui text-sm tracking-widest text-past"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        San Francisco across time
      </motion.p>
    </motion.div>
  )
}
