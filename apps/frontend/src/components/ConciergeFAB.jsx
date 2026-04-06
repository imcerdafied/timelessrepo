import { motion } from 'framer-motion'

export default function ConciergeFAB({ onClick }) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-40 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-accent/30 bg-primary shadow-lg cursor-pointer mobile-frame"
      style={{ position: 'fixed', right: 16, left: 'auto', margin: 0, maxWidth: 56 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1, type: 'spring', stiffness: 300, damping: 25 }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E8A87C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    </motion.button>
  )
}
