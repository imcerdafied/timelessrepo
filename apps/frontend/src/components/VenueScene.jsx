import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ERA_CHARACTERS } from '../data/era-characters'
import { CharacterChat } from './CharacterChat'
import { voiceService } from '../services/voiceService'

export default function VenueScene({ venue, era, onClose, autoplay }) {
  // phases: intro (venue card) → scene (passive monologue) → chat (interactive)
  const [phase, setPhase] = useState('intro')
  const [revealedText, setRevealedText] = useState('')
  const revealInterval = useRef(null)

  // Resolve the character: venue's generated_character or ERA_CHARACTERS lookup
  const character = venue.generated_character
    || (venue.characters?.[0] && ERA_CHARACTERS[venue.characters[0]])
    || null

  // Build the venue-aware system prompt
  const venueContext = `SCENE CONTEXT:\n${venue.scene_prompt}`

  // Auto-advance from intro → scene (if scene_intro exists) or chat
  useEffect(() => {
    const delay = autoplay ? 800 : 2000
    const timer = setTimeout(() => {
      if (venue.scene_intro && character) {
        setPhase('scene')
      } else {
        setPhase('chat')
      }
    }, delay)
    return () => clearTimeout(timer)
  }, [autoplay, character, venue.scene_intro])

  // Text reveal effect for scene phase
  useEffect(() => {
    if (phase !== 'scene' || !venue.scene_intro) return

    const words = venue.scene_intro.split(' ')
    let index = 0
    setRevealedText('')

    revealInterval.current = setInterval(() => {
      index++
      setRevealedText(words.slice(0, index).join(' '))
      if (index >= words.length) {
        clearInterval(revealInterval.current)
      }
    }, 80)

    // Speak the intro via TTS
    voiceService.speak(venue.scene_intro, era?.id)

    return () => {
      if (revealInterval.current) clearInterval(revealInterval.current)
    }
  }, [era?.id, phase, venue.scene_intro])

  function enterChat() {
    if (revealInterval.current) clearInterval(revealInterval.current)
    voiceService.stop()
    setPhase('chat')
  }

  return createPortal(
    <AnimatePresence>
      {phase === 'intro' && (
        <motion.div
          key="venue-intro"
          className="mobile-frame"
          style={{
            position: 'fixed',
            top: 0,
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

      {phase === 'scene' && character && (
        <motion.div
          key="venue-scene"
          className="mobile-frame"
          style={{
            position: 'fixed',
            top: 0,
            bottom: 0,
            zIndex: 9999,
            backgroundColor: '#000',
            display: 'flex',
            flexDirection: 'column',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          onClick={enterChat}
        >
          {/* Header */}
          <div style={{
            paddingTop: 'max(16px, env(safe-area-inset-top))',
            paddingLeft: 16,
            paddingRight: 16,
            paddingBottom: 12,
          }}>
            <button
              onClick={(e) => { e.stopPropagation(); voiceService.stop(); onClose() }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}
            >
              <span>&larr;</span>
              <span style={{ marginLeft: 8 }}>Leave</span>
            </button>
          </div>

          {/* Scene content, centered monologue */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 28px',
            maxWidth: 420,
            margin: '0 auto',
          }}>
            {/* Character identity */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              style={{ marginBottom: 20 }}
            >
              <div style={{
                color: '#C8860A',
                fontSize: 11,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 4,
              }}>
                {era?.year_display}
              </div>
              <div style={{
                color: 'white',
                fontSize: 20,
                fontWeight: 600,
                fontFamily: "'Playfair Display', serif",
              }}>
                {character.name}
              </div>
              <div style={{
                color: 'rgba(255,255,255,0.4)',
                fontSize: 13,
                marginTop: 2,
              }}>
                {character.role}
              </div>
            </motion.div>

            {/* Monologue text, word by word reveal */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              style={{
                color: 'rgba(255,255,255,0.85)',
                fontSize: 17,
                lineHeight: 1.7,
                fontStyle: 'italic',
                fontFamily: "'Playfair Display', serif",
              }}
            >
              {revealedText}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
                style={{ color: '#C8860A' }}
              >
                |
              </motion.span>
            </motion.div>
          </div>

          {/* Bottom prompt */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            style={{
              textAlign: 'center',
              paddingBottom: 'max(32px, env(safe-area-inset-bottom))',
              paddingTop: 16,
            }}
          >
            <div style={{
              color: 'rgba(255,255,255,0.25)',
              fontSize: 12,
              letterSpacing: '0.08em',
            }}>
              Tap anywhere to speak with {character.name.split(' ')[0]}
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
          sceneIntro={venue.scene_intro}
          onDismiss={onClose}
        />
      )}
    </AnimatePresence>,
    document.body
  )
}
