import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useStoryStore from '../store/useStoryStore'
import { sendStoryMessage } from '../services/storyService'
import { voiceService } from '../services/voiceService'
import VoteBar from './VoteBar'
import ShareCard from './ShareCard'

export default function EpisodePlayer() {
  const { activeStory: story, activeEpisode: episode, setActiveStory, setActiveEpisode, chatHistory, addMessage, votes, getNextEpisode } = useStoryStore()
  const [phase, setPhase] = useState('scene') // scene → interact → vote
  const [revealedText, setRevealedText] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [exchangeCount, setExchangeCount] = useState(0)
  const [shareOpen, setShareOpen] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(voiceService.enabled)
  const [inputVisible, setInputVisible] = useState(false)
  const revealInterval = useRef(null)
  const inputRef = useRef(null)
  const messagesEndRef = useRef(null)

  const imageUrl = story.cover_image
  const hasVoted = !!votes[episode.id]
  const firstName = story.character.split(' ')[0]

  // Reset on episode change
  useEffect(() => {
    setPhase('scene')
    setRevealedText('')
    setMessages([])
    setExchangeCount(0)
    setShareOpen(false)
    setInputVisible(false)
  }, [episode.id])

  // Scene text reveal
  useEffect(() => {
    if (phase !== 'scene') return

    const lines = episode.scene.split('\n').map(l => l.trim()).filter(Boolean)
    const words = lines.join(' ').split(' ')
    let index = 0
    setRevealedText('')

    revealInterval.current = setInterval(() => {
      index++
      setRevealedText(words.slice(0, index).join(' '))
      if (index >= words.length) {
        clearInterval(revealInterval.current)
        // Auto-advance to interact after text completes + pause
        setTimeout(() => setPhase('interact'), 2000)
      }
    }, 70)

    // Speak the scene
    voiceService.speak(episode.scene, story.voice_id)

    return () => {
      if (revealInterval.current) clearInterval(revealInterval.current)
    }
  }, [phase, episode.id])

  // Inject contenteditable placeholder CSS
  useEffect(() => {
    const style = document.createElement('style')
    style.innerText = '[contenteditable]:empty:before { content: attr(data-placeholder); color: rgba(255,255,255,0.35); pointer-events: none; }'
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function skipScene() {
    if (revealInterval.current) clearInterval(revealInterval.current)
    const lines = episode.scene.split('\n').map(l => l.trim()).filter(Boolean)
    setRevealedText(lines.join(' '))
    voiceService.stop()
    setTimeout(() => setPhase('interact'), 500)
  }

  async function handleSend() {
    const text = inputRef.current?.innerText?.trim()
    if (!text || loading) return

    inputRef.current.innerText = ''
    setLoading(true)

    const userMsg = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    addMessage(episode.id, userMsg)

    try {
      const response = await sendStoryMessage(
        story,
        episode,
        messages,
        text
      )
      const assistantMsg = { role: 'assistant', content: response }
      setMessages([...newMessages, assistantMsg])
      addMessage(episode.id, assistantMsg)
      voiceService.speak(response, story.voice_id)

      const newCount = exchangeCount + 1
      setExchangeCount(newCount)
    } catch (err) {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: `[Error: ${err.message}]` }
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleBack() {
    voiceService.stop()
    setActiveStory(null)
    setActiveEpisode(null)
  }

  function handleVoted(option, consequence) {
    // Vote is registered in store
  }

  function handleNextEpisode() {
    const next = getNextEpisode(story, episode)
    if (next) {
      setActiveEpisode(next)
    }
  }

  const nextEpisode = getNextEpisode(story, episode)

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      backgroundColor: '#000',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 'max(12px, env(safe-area-inset-top))',
        paddingLeft: 16,
        paddingRight: 16,
        paddingBottom: 10,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backgroundColor: '#000',
        zIndex: 10,
      }}>
        <button
          onClick={handleBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.5)',
            fontSize: 14,
          }}
        >
          <span>&larr;</span>
          <span>Stories</span>
        </button>
        <div style={{
          fontSize: 12,
          color: 'rgba(255,255,255,0.35)',
          textAlign: 'center',
        }}>
          {episode.title}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setVoiceEnabled(voiceService.toggle())}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 4 }}
          >
            {voiceEnabled ? '\u{1F50A}' : '\u{1F507}'}
          </button>
          <button
            onClick={() => setShareOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, padding: 4, color: 'rgba(255,255,255,0.4)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </button>
        </div>
      </div>

      {/* PHASE 1: SCENE */}
      {phase === 'scene' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 28px',
          }}
          onClick={skipScene}
        >
          {/* Background image at low opacity */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.15,
            filter: 'blur(2px)',
          }} />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: 400, margin: '0 auto' }}>
            {/* Character name */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              style={{ marginBottom: 20 }}
            >
              <div style={{
                color: '#C8860A',
                fontSize: 11,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: 4,
              }}>
                {story.location} &middot; {story.year}
              </div>
              <div style={{
                fontSize: 22,
                fontWeight: 600,
                fontFamily: "'Playfair Display', serif",
                color: 'white',
              }}>
                {story.character}
              </div>
              <div style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.4)',
                marginTop: 2,
              }}>
                {story.role}
              </div>
            </motion.div>

            {/* Scene text reveal */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              style={{
                fontSize: 17,
                lineHeight: 1.7,
                fontStyle: 'italic',
                fontFamily: "'Playfair Display', serif",
                color: 'rgba(255,255,255,0.85)',
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

          {/* Tap hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3, duration: 1 }}
            style={{
              position: 'absolute',
              bottom: 'max(32px, env(safe-area-inset-bottom))',
              left: 0,
              right: 0,
              textAlign: 'center',
              fontSize: 12,
              color: 'rgba(255,255,255,0.2)',
              letterSpacing: '0.06em',
            }}
          >
            Tap to continue
          </motion.div>
        </motion.div>
      )}

      {/* PHASE 2: INTERACT */}
      {phase === 'interact' && (
        <InteractPhase
          story={story}
          episode={episode}
          firstName={firstName}
          messages={messages}
          loading={loading}
          exchangeCount={exchangeCount}
          hasVoted={hasVoted}
          inputVisible={inputVisible}
          setInputVisible={setInputVisible}
          inputRef={inputRef}
          messagesEndRef={messagesEndRef}
          handleSend={handleSend}
          setPhase={setPhase}
        />
      )}

      {/* PHASE 3: VOTE */}
      {phase === 'vote' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <VoteBar
            episode={episode}
            story={story}
            onVoted={handleVoted}
          />

          {/* Post-vote: next episode or come back tomorrow */}
          <AnimatePresence>
            {hasVoted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                style={{
                  textAlign: 'center',
                  padding: '40px 24px',
                }}
              >
                {nextEpisode ? (
                  <button
                    onClick={handleNextEpisode}
                    style={{
                      backgroundColor: '#C8860A',
                      color: '#000',
                      border: 'none',
                      borderRadius: 12,
                      padding: '14px 28px',
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Continue to {nextEpisode.title} &rarr;
                  </button>
                ) : (
                  <div>
                    <div style={{
                      fontSize: 18,
                      fontFamily: "'Playfair Display', serif",
                      color: '#C8860A',
                      fontStyle: 'italic',
                      marginBottom: 24,
                      lineHeight: 1.5,
                    }}>
                      Come back tomorrow for Episode 2.
                    </div>
                    <button
                      onClick={() => setShareOpen(true)}
                      style={{
                        backgroundColor: 'transparent',
                        color: '#C8860A',
                        border: '1px solid rgba(200,134,10,0.4)',
                        borderRadius: 12,
                        padding: '14px 28px',
                        fontSize: 15,
                        fontWeight: 500,
                        cursor: 'pointer',
                        letterSpacing: '0.02em',
                      }}
                    >
                      Share {firstName}'s story
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Share overlay */}
      <AnimatePresence>
        {shareOpen && (
          <ShareCard
            story={story}
            episode={episode}
            onClose={() => setShareOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function InteractPhase({ story, episode, firstName, messages, loading, exchangeCount, hasVoted, inputVisible, setInputVisible, inputRef, messagesEndRef, handleSend, setPhase }) {
  // Show "listening" indicator, then reveal input after 3s
  useEffect(() => {
    const timer = setTimeout(() => setInputVisible(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {/* Scene as first message */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-start',
          marginBottom: 12,
        }}>
          <div style={{
            maxWidth: '85%',
            borderRadius: 16,
            padding: '12px 16px',
            backgroundColor: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
            fontSize: 14,
            lineHeight: 1.6,
            color: 'rgba(255,255,255,0.8)',
            fontStyle: 'italic',
          }}>
            {episode.scene}
          </div>
        </div>

        {/* Listening indicator */}
        {!inputVisible && messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            style={{
              textAlign: 'center',
              padding: '20px 0',
              fontSize: 13,
              color: 'rgba(255,255,255,0.35)',
              fontStyle: 'italic',
            }}
          >
            {firstName} is listening...
          </motion.div>
        )}

        {/* Chat messages */}
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: 12,
            }}
          >
            <div style={{
              maxWidth: '85%',
              borderRadius: 16,
              padding: '12px 16px',
              backgroundColor: msg.role === 'user'
                ? 'rgba(200,134,10,0.15)'
                : 'rgba(255,255,255,0.06)',
              border: msg.role === 'user'
                ? '1px solid rgba(200,134,10,0.25)'
                : '1px solid rgba(255,255,255,0.08)',
              fontSize: 14,
              lineHeight: 1.6,
              color: msg.role === 'user'
                ? 'rgba(255,255,255,0.9)'
                : 'rgba(255,255,255,0.8)',
              fontStyle: msg.role === 'assistant' ? 'italic' : 'normal',
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 12 }}>
            <div style={{
              borderRadius: 16,
              padding: '12px 16px',
              backgroundColor: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              gap: 4,
            }}>
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: 'rgba(255,255,255,0.4)',
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Nudge to vote after 2 exchanges */}
        <AnimatePresence>
          {exchangeCount >= 2 && !hasVoted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: 'center', padding: '16px 0' }}
            >
              <button
                onClick={() => setPhase('vote')}
                style={{
                  backgroundColor: '#C8860A',
                  color: '#000',
                  border: 'none',
                  borderRadius: 12,
                  padding: '12px 24px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Ready to decide? &rarr;
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input row + skip to vote */}
      <AnimatePresence>
        {inputVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Skip to vote link */}
            <div style={{
              textAlign: 'center',
              paddingBottom: 8,
            }}>
              <button
                onClick={() => setPhase('vote')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(200,134,10,0.6)',
                  fontSize: 13,
                  cursor: 'pointer',
                  padding: '4px 8px',
                }}
              >
                Skip to vote &rarr;
              </button>
            </div>

            {/* Input row */}
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              padding: '12px 16px',
              paddingRight: 'max(16px, env(safe-area-inset-right, 16px))',
              paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
              backgroundColor: '#111',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              boxSizing: 'border-box',
            }}>
              <div
                ref={inputRef}
                contentEditable
                suppressContentEditableWarning
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="off"
                data-gramm="false"
                data-gramm_editor="false"
                data-enable-grammarly="false"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                data-placeholder={`Ask ${firstName} anything...`}
                style={{
                  flex: 1,
                  minWidth: 0,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: 24,
                  padding: '10px 16px',
                  color: 'white',
                  fontSize: 15,
                  outline: 'none',
                  minHeight: 20,
                  maxHeight: 80,
                  overflowY: 'auto',
                  wordBreak: 'break-word',
                }}
              />
              <button
                onMouseDown={(e) => { e.preventDefault(); handleSend() }}
                style={{
                  flexShrink: 0,
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: '#C8860A',
                  border: 'none',
                  color: '#000',
                  fontSize: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                &rarr;
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
