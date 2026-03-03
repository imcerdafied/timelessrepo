import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ERA_CHARACTERS } from '../data/era-characters'
import { CharacterChat } from './CharacterChat'

export default function VenueScene({ venue, era, onClose }) {
  const [phase, setPhase] = useState('intro')
  // phases: intro (2s scene-setting) → chat

  // Auto-advance from intro to chat after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => setPhase('chat'), 2000)
    return () => clearTimeout(timer)
  }, [])

  // Resolve the character: venue's generated_character or ERA_CHARACTERS lookup
  const character = venue.generated_character
    || (venue.characters?.[0] && ERA_CHARACTERS[venue.characters[0]])
    || null

  // Build the venue-aware system prompt
  const venueContext = `SCENE CONTEXT:\n${venue.scene_prompt}`

  return createPortal(
    <AnimatePresence>
      {phase === 'intro' && (
        <motion.div
          key="venue-intro"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            backgroundColor: '#000',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '32px',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{ textAlign: 'center', maxWidth: 340 }}
          >
            <div style={{ fontSize: 36, marginBottom: 12 }}>{venue.icon}</div>
            <div style={{
              color: 'white', fontSize: 22, fontWeight: 600,
              fontFamily: "'Playfair Display', serif", marginBottom: 8
            }}>
              {venue.name}
            </div>
            <div style={{
              color: 'rgba(255,255,255,0.4)', fontSize: 12,
              letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16
            }}>
              {venue.tagline}
            </div>
            <div style={{
              color: 'rgba(255,255,255,0.55)', fontSize: 14,
              fontStyle: 'italic', lineHeight: 1.6
            }}>
              {venue.description}
            </div>
          </motion.div>
        </motion.div>
      )}

      {phase === 'chat' && character && (
        <CharacterChat
          key="venue-chat"
          era={era}
          character={character}
          venueContext={venueContext}
          backLabel={venue.name}
          onDismiss={onClose}
        />
      )}
    </AnimatePresence>,
    document.body
  )
}
