import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useStoryStore from '../store/useStoryStore'
import { sendStoryMessage, castVote as submitVote, generateVideo } from '../services/storyService'
import { voiceService } from '../services/voiceService'
import { track } from '../services/analytics'
import ShareCard from './ShareCard'

const ZOE_IMAGE = 'https://xllwzunjvidtszyklhhm.supabase.co/storage/v1/object/public/characters/zoe.png'

export default function EpisodePlayer() {
  const {
    activeStory: story,
    activeEpisode: episode,
    setActiveStory,
    setActiveEpisode,
    addMessage,
    votes,
    castVote,
    getNextEpisode,
  } = useStoryStore()

  const [phase, setPhase] = useState('idle') // idle → loading → video → interact → vote
  const [videoUrl, setVideoUrl] = useState(null)
  const [videoError, setVideoError] = useState(false)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [exchangeCount, setExchangeCount] = useState(0)
  const [inputVisible, setInputVisible] = useState(false)
  const [tallies, setTallies] = useState(null)
  const [totalVotes, setTotalVotes] = useState(0)
  const [showPostVote, setShowPostVote] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(voiceService.enabled)

  // Fallback scene text state (used if D-ID fails)
  const [revealedCount, setRevealedCount] = useState(0)
  const [sceneComplete, setSceneComplete] = useState(false)
  const sceneTimers = useRef([])

  const inputRef = useRef(null)
  const messagesEndRef = useRef(null)
  const videoRef = useRef(null)
  const sceneStartTime = useRef(Date.now())

  const hasVoted = !!votes[episode.id]
  const firstName = story.character_name.split(' ')[0]
  const votedOptionId = votes[episode.id]
  const votedOption = episode.vote_options.find(o => o.id === votedOptionId)
  const nextEpisode = getNextEpisode(story, episode)

  // Parse scene text
  const sceneText = episode.scene
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .join(' ')
  const sceneWords = sceneText.split(' ')

  // Reset on episode change
  useEffect(() => {
    setPhase('idle')
    setVideoUrl(null)
    setVideoError(false)
    setRevealedCount(0)
    setSceneComplete(false)
    setMessages([])
    setExchangeCount(0)
    setInputVisible(false)
    setTallies(null)
    setTotalVotes(0)
    setShowPostVote(false)
    setShareOpen(false)
    sceneStartTime.current = Date.now()
  }, [episode.id])

  // Scene text reveal (fallback mode)
  useEffect(() => {
    if (phase !== 'scene') return

    let totalDelay = 500
    const timers = []

    sceneWords.forEach((word, i) => {
      timers.push(setTimeout(() => setRevealedCount(i + 1), totalDelay))
      totalDelay += 180
      if (/[.!?]$/.test(word)) totalDelay += 400
      else if (/[,;:]$/.test(word)) totalDelay += 200
    })

    timers.push(setTimeout(() => {
      setSceneComplete(true)
      track('dispatch_scene_completed', {
        episode_id: episode.id,
        listened_seconds: Math.round((Date.now() - sceneStartTime.current) / 1000),
      })
    }, totalDelay + 2000))

    sceneTimers.current = timers
    return () => timers.forEach(clearTimeout)
  }, [phase, episode.id])

  // Scene complete → interact (fallback mode)
  useEffect(() => {
    if (sceneComplete && phase === 'scene') {
      setPhase('interact')
    }
  }, [sceneComplete, phase])

  // Show input after entering interact phase
  useEffect(() => {
    if (phase !== 'interact') return
    const timer = setTimeout(() => setInputVisible(true), 1200)
    return () => clearTimeout(timer)
  }, [phase])

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Inject contenteditable placeholder CSS
  useEffect(() => {
    const style = document.createElement('style')
    style.innerText = '[contenteditable]:empty:before { content: attr(data-placeholder); color: rgba(255,255,255,0.35); pointer-events: none; }'
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  // Auto-transition to vote after 3 exchanges
  useEffect(() => {
    if (exchangeCount >= 3) {
      const timer = setTimeout(() => setPhase('vote'), 1500)
      return () => clearTimeout(timer)
    }
  }, [exchangeCount])

  async function handleBegin() {
    setPhase('loading')
    sceneStartTime.current = Date.now()
    track('dispatch_episode_started', { episode_id: episode.id })

    try {
      const url = await generateVideo(episode.id, sceneText, story.voice_id)
      setVideoUrl(url)
      setPhase('video')
    } catch (err) {
      console.error('D-ID failed, falling back to text:', err.message)
      setVideoError(true)
      setPhase('scene')
      // Voice triggered inside user gesture chain
      voiceService.speak(sceneText, story.voice_id)
    }
  }

  function handleVideoEnd() {
    track('dispatch_scene_completed', {
      episode_id: episode.id,
      listened_seconds: Math.round((Date.now() - sceneStartTime.current) / 1000),
      mode: 'video',
    })
    setPhase('interact')
  }

  function skipVideo() {
    if (videoRef.current) {
      videoRef.current.pause()
    }
    track('dispatch_scene_skipped', {
      episode_id: episode.id,
      at_seconds: Math.round((Date.now() - sceneStartTime.current) / 1000),
      mode: 'video',
    })
    setPhase('interact')
  }

  function skipScene() {
    sceneTimers.current.forEach(clearTimeout)
    setRevealedCount(sceneWords.length)
    voiceService.stop()
    track('dispatch_scene_skipped', {
      episode_id: episode.id,
      at_seconds: Math.round((Date.now() - sceneStartTime.current) / 1000),
      mode: 'text',
    })
    setTimeout(() => setSceneComplete(true), 500)
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

    track('dispatch_message_sent', {
      episode_id: episode.id,
      message_count: newMessages.filter(m => m.role === 'user').length,
    })

    try {
      const response = await sendStoryMessage(story, episode, messages, text)
      const assistantMsg = { role: 'assistant', content: response }
      setMessages([...newMessages, assistantMsg])
      addMessage(episode.id, assistantMsg)
      voiceService.speak(response, story.voice_id)
      setExchangeCount(prev => prev + 1)
    } catch (err) {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: `[Error: ${err.message}]` },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleBack() {
    voiceService.stop()
    if (videoRef.current) videoRef.current.pause()
    setActiveStory(null)
    setActiveEpisode(null)
  }

  async function handleVote(option) {
    castVote(episode.id, option.id, option.consequence)
    track('dispatch_vote_cast', { episode_id: episode.id, option_id: option.id })

    try {
      const result = await submitVote(episode.id, option.id)
      if (result.tallies) {
        setTallies(result.tallies)
        setTotalVotes(result.total || Object.values(result.tallies).reduce((s, v) => s + v, 0))
      }
    } catch {
      setTallies({ [option.id]: 1 })
      setTotalVotes(1)
    }

    setTimeout(() => setShowPostVote(true), 2000)
  }

  function handleNextEpisode() {
    if (nextEpisode) {
      track('dispatch_next_episode', { from_episode: episode.id, to_episode: nextEpisode.id })
      setActiveEpisode(nextEpisode)
    }
  }

  function getPercent(optionId) {
    if (!tallies) return 50
    const total = Object.values(tallies).reduce((s, v) => s + v, 0)
    if (!total) return 50
    return Math.round(((tallies[optionId] || 0) / total) * 100)
  }

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
          <span style={{
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#f59e0b',
          }}>
            DISPATCH
          </span>
        </button>
        <div style={{
          fontSize: 12,
          color: 'rgba(255,255,255,0.35)',
          textAlign: 'center',
        }}>
          Episode {episode.number} &middot; {episode.day_label}
        </div>
        <button
          onClick={() => setVoiceEnabled(voiceService.toggle())}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 16,
            padding: 4,
          }}
        >
          {voiceEnabled ? '\u{1F50A}' : '\u{1F507}'}
        </button>
      </div>

      {/* ─── IDLE: TAP TO BEGIN ─── */}
      {phase === 'idle' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 32px',
            position: 'relative',
          }}
        >
          {/* Zoe background at 20% opacity */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${ZOE_IMAGE})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            opacity: 0.2,
          }} />

          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div style={{
              fontSize: 11,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#f59e0b',
              fontWeight: 600,
              marginBottom: 24,
            }}>
              DISPATCH
            </div>

            <div style={{
              fontSize: 22,
              fontFamily: "Georgia, 'Times New Roman', serif",
              color: 'white',
              marginBottom: 8,
            }}>
              {episode.title}
            </div>

            <div style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.35)',
              marginBottom: 48,
            }}>
              Episode {episode.number}
            </div>

            <button
              onClick={handleBegin}
              style={{
                backgroundColor: '#f59e0b',
                color: '#000',
                border: 'none',
                borderRadius: 12,
                padding: '16px 48px',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: 20,
              }}
            >
              Begin &rarr;
            </button>

            <div style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.25)',
              lineHeight: 1.5,
            }}>
              Turn up your sound
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── LOADING: GENERATING VIDEO ─── */}
      {phase === 'loading' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 32px',
            position: 'relative',
          }}
        >
          {/* Zoe background at 40% opacity */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${ZOE_IMAGE})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            opacity: 0.4,
          }} />

          {/* Gradient overlay for text legibility */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.8) 100%)',
          }} />

          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'relative',
              zIndex: 1,
              fontSize: 18,
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontStyle: 'italic',
              color: '#f59e0b',
              textAlign: 'center',
            }}
          >
            Connecting to {firstName}...
          </motion.div>
        </motion.div>
      )}

      {/* ─── VIDEO: D-ID TALKING HEAD ─── */}
      {phase === 'video' && videoUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          onClick={skipVideo}
          style={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000',
            cursor: 'pointer',
          }}
        >
          <video
            ref={videoRef}
            src={videoUrl}
            autoPlay
            playsInline
            onEnded={handleVideoEnd}
            onError={() => {
              console.error('Video playback error')
              setPhase('interact')
            }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />

          {/* Subtle skip indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3, duration: 0.5 }}
            style={{
              position: 'absolute',
              bottom: 'max(24px, env(safe-area-inset-bottom))',
              right: 24,
              fontSize: 12,
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: '0.05em',
            }}
          >
            tap to skip
          </motion.div>

          {/* Character name overlay */}
          <div style={{
            position: 'absolute',
            bottom: 'max(24px, env(safe-area-inset-bottom))',
            left: 24,
            fontSize: 11,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#f59e0b',
            fontWeight: 600,
          }}>
            {firstName.toUpperCase()}
          </div>
        </motion.div>
      )}

      {/* ─── SCENE: TEXT FALLBACK ─── */}
      {phase === 'scene' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={skipScene}
          style={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 28px',
          }}
        >
          {/* Background image at 8% opacity */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${ZOE_IMAGE})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.08,
            filter: 'blur(2px)',
          }} />

          <div style={{
            position: 'relative',
            zIndex: 1,
            maxWidth: 400,
            margin: '0 auto',
            width: '100%',
          }}>
            {/* Character name */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              style={{
                fontSize: 12,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#f59e0b',
                marginBottom: 20,
                fontWeight: 600,
              }}
            >
              {firstName.toUpperCase()}
            </motion.div>

            {/* Scene text word by word */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              style={{
                fontSize: 17,
                lineHeight: 1.8,
                fontStyle: 'italic',
                fontFamily: "Georgia, 'Times New Roman', serif",
                color: 'rgba(255,255,255,0.85)',
              }}
            >
              {sceneWords.slice(0, revealedCount).join(' ')}
              {revealedCount < sceneWords.length && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                  style={{ color: '#f59e0b' }}
                >
                  |
                </motion.span>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* ─── INTERACT ─── */}
      {phase === 'interact' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
            {/* Scene summary (collapsed) */}
            <div style={{
              fontSize: 14,
              lineHeight: 1.6,
              fontStyle: 'italic',
              fontFamily: "Georgia, 'Times New Roman', serif",
              color: 'rgba(255,255,255,0.5)',
              marginBottom: 20,
              paddingBottom: 20,
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {sceneText}
            </div>

            {/* Listening indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              style={{
                fontSize: 14,
                color: '#f59e0b',
                fontStyle: 'italic',
                marginBottom: 20,
                opacity: 0.7,
              }}
            >
              She's listening.
            </motion.div>

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
                    ? 'rgba(245,158,11,0.12)'
                    : 'rgba(255,255,255,0.06)',
                  border: msg.role === 'user'
                    ? '1px solid rgba(245,158,11,0.2)'
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

            {/* Loading dots */}
            {loading && (
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                marginBottom: 12,
              }}>
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

            {/* Ready to vote after 2 exchanges */}
            {exchangeCount >= 2 && exchangeCount < 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ textAlign: 'center', padding: '16px 0' }}
              >
                <button
                  onClick={() => setPhase('vote')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#f59e0b',
                    fontSize: 14,
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  Ready to vote? &rarr;
                </button>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <AnimatePresence>
            {inputVisible && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* Skip to vote */}
                <div style={{ textAlign: 'center', paddingBottom: 8 }}>
                  <button
                    onClick={() => setPhase('vote')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(245,158,11,0.5)',
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    Skip to vote &rarr;
                  </button>
                </div>

                {/* Input row */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 16px',
                  paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
                  backgroundColor: '#111',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
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
                      backgroundColor: '#f59e0b',
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
      )}

      {/* ─── VOTE ─── */}
      {phase === 'vote' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 32px',
          }}
        >
          {/* Episode title */}
          <div style={{
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.3)',
            textAlign: 'center',
            marginBottom: 32,
          }}>
            {episode.title}
          </div>

          {/* Vote question */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              fontSize: 22,
              fontFamily: "Georgia, 'Times New Roman', serif",
              color: 'white',
              textAlign: 'center',
              lineHeight: 1.4,
              marginBottom: 32,
            }}
          >
            {episode.vote_question}
          </motion.div>

          {/* Vote options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {episode.vote_options.map((option, i) => (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                onClick={() => !hasVoted && handleVote(option)}
                disabled={hasVoted}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  width: '100%',
                  minHeight: 72,
                  padding: '14px 24px',
                  borderRadius: 12,
                  overflow: 'hidden',
                  border: hasVoted && votedOptionId === option.id
                    ? '2px solid #f59e0b'
                    : '1px solid rgba(245,158,11,0.4)',
                  backgroundColor: hasVoted && votedOptionId === option.id
                    ? 'rgba(245,158,11,0.15)'
                    : 'rgba(255,255,255,0.06)',
                  color: 'white',
                  cursor: hasVoted ? 'default' : 'pointer',
                  textAlign: 'left',
                  boxSizing: 'border-box',
                }}
              >
                {/* Percentage bar */}
                {hasVoted && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${getPercent(option.id)}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      backgroundColor: votedOptionId === option.id
                        ? 'rgba(245,158,11,0.15)'
                        : 'rgba(255,255,255,0.04)',
                      borderRadius: 12,
                    }}
                  />
                )}

                <div style={{
                  position: 'relative',
                  zIndex: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 500 }}>
                      {option.label}
                    </div>
                    {!hasVoted && (
                      <div style={{
                        fontSize: 13,
                        fontStyle: 'italic',
                        color: 'rgba(245,158,11,0.6)',
                        marginTop: 2,
                      }}>
                        {option.cost}
                      </div>
                    )}
                  </div>
                  {hasVoted && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: votedOptionId === option.id
                          ? '#f59e0b'
                          : 'rgba(255,255,255,0.5)',
                      }}
                    >
                      {getPercent(option.id)}%
                    </motion.span>
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Total votes */}
          {hasVoted && totalVotes > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              style={{
                textAlign: 'center',
                fontSize: 13,
                color: 'rgba(255,255,255,0.3)',
                marginTop: 16,
              }}
            >
              {totalVotes} {totalVotes === 1 ? 'person' : 'people'} voted
            </motion.div>
          )}

          {/* Post-vote CTA */}
          <AnimatePresence>
            {showPostVote && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', padding: '32px 0' }}
              >
                {nextEpisode ? (
                  <button
                    onClick={handleNextEpisode}
                    style={{
                      backgroundColor: '#f59e0b',
                      color: '#000',
                      border: 'none',
                      borderRadius: 12,
                      padding: '14px 28px',
                      fontSize: 15,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Episode {nextEpisode.number} is ready &rarr;
                  </button>
                ) : (
                  <div>
                    <div style={{
                      fontSize: 16,
                      fontFamily: "Georgia, 'Times New Roman', serif",
                      color: '#f59e0b',
                      fontStyle: 'italic',
                      marginBottom: 8,
                      lineHeight: 1.5,
                    }}>
                      Episode {episode.number + 1} drops tomorrow.
                    </div>
                    <div style={{
                      fontSize: 14,
                      color: 'rgba(255,255,255,0.4)',
                      marginBottom: 24,
                    }}>
                      We'll tell {firstName} what you decided.
                    </div>
                    <button
                      onClick={() => {
                        setShareOpen(true)
                        track('dispatch_share_tapped', { episode_id: episode.id })
                      }}
                      style={{
                        backgroundColor: 'transparent',
                        color: '#f59e0b',
                        border: '1px solid rgba(245,158,11,0.4)',
                        borderRadius: 12,
                        padding: '14px 28px',
                        fontSize: 15,
                        fontWeight: 500,
                        cursor: 'pointer',
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
            votedOption={votedOption}
            percent={votedOption ? getPercent(votedOption.id) : null}
            onClose={() => setShareOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
