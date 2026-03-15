import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useStoryStore from '../store/useStoryStore'
import { sendStoryMessage, castVote as submitVote } from '../services/storyService'
import { voiceService } from '../services/voiceService'
import { track } from '../services/analytics'
import ShareCard from './ShareCard'

const ZOE_IMAGE = 'https://xllwzunjvidtszyklhhm.supabase.co/storage/v1/object/public/characters/zoe.png'

// Split scene text into sentences for progressive reveal
function splitSentences(text) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean)
}

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

  // Phases: scene → interact → vote
  const [phase, setPhase] = useState('scene')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [exchangeCount, setExchangeCount] = useState(0)
  const [inputVisible, setInputVisible] = useState(false)
  const [tallies, setTallies] = useState(null)
  const [totalVotes, setTotalVotes] = useState(0)
  const [showPostVote, setShowPostVote] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(voiceService.enabled)
  const [visibleSentences, setVisibleSentences] = useState(0)
  const [userTapped, setUserTapped] = useState(false)

  const inputRef = useRef(null)
  const messagesEndRef = useRef(null)
  const audioRef = useRef(null)
  const sceneStartTime = useRef(Date.now())
  const sentenceTimer = useRef(null)
  const scrollRef = useRef(null)

  const hasVoted = !!votes[episode.id]
  const firstName = story.character_name.split(' ')[0]
  const votedOptionId = votes[episode.id]
  const votedOption = episode.vote_options.find(o => o.id === votedOptionId)
  const nextEpisode = getNextEpisode(story, episode)

  // Parse scene text into sentences
  const sceneText = episode.scene.split('\n').map(l => l.trim()).filter(Boolean).join(' ')
  const sentences = splitSentences(sceneText)

  // Reset on episode change
  useEffect(() => {
    setPhase('scene')
    setMessages([])
    setExchangeCount(0)
    setInputVisible(false)
    setTallies(null)
    setTotalVotes(0)
    setShowPostVote(false)
    setShareOpen(false)
    setVisibleSentences(0)
    setUserTapped(false)
    sceneStartTime.current = Date.now()
    voiceService.stop()

    // Preload audio
    const audio = new Audio()
    audio.preload = 'auto'
    audio.src = 'https://xllwzunjvidtszyklhhm.supabase.co/storage/v1/object/public/episodes/' + episode.id + '.mp3'
    audioRef.current = audio

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
      if (sentenceTimer.current) clearInterval(sentenceTimer.current)
    }
  }, [episode.id])

  // Start scene when user taps (needed for autoplay policy)
  const startScene = useCallback(() => {
    if (phase !== 'scene') return
    sceneStartTime.current = Date.now()
    track('scene_started', { session_id: localStorage.getItem('dispatch_session'), episode_id: episode.id })

    const audio = audioRef.current
    let audioDuration = sentences.length * 4 // fallback

    if (audio && audio.src) {
      const playPromise = audio.play()
      if (playPromise) playPromise.catch(() => {})

      // Try to get real duration once metadata loads
      if (audio.duration && isFinite(audio.duration)) {
        audioDuration = audio.duration
      } else {
        audio.addEventListener('loadedmetadata', () => {
          if (audio.duration && isFinite(audio.duration)) {
            // Adjust interval if we get real duration
          }
        }, { once: true })
      }
    }

    const interval = (audioDuration / sentences.length) * 1000

    let count = 0
    setVisibleSentences(1)
    sentenceTimer.current = setInterval(() => {
      count++
      if (count >= sentences.length) {
        clearInterval(sentenceTimer.current)
        setTimeout(() => {
          track('scene_completed', {
            session_id: localStorage.getItem('dispatch_session'),
            episode_id: episode.id,
            watch_time_s: Math.round((Date.now() - sceneStartTime.current) / 1000),
          })
          setPhase('interact')
        }, 2000)
      }
      setVisibleSentences(c => Math.min(c + 1, sentences.length))
    }, interval)
  }, [phase, episode.id, sentences.length])

  function handleTapToStart() {
    setUserTapped(true)
    startScene()
  }

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

  // Auto-scroll scene text
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [visibleSentences])

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

  function skipScene() {
    if (audioRef.current) audioRef.current.pause()
    if (sentenceTimer.current) clearInterval(sentenceTimer.current)
    track('scene_skipped', {
      session_id: localStorage.getItem('dispatch_session'),
      episode_id: episode.id,
      exit_pct: Math.round((visibleSentences / sentences.length) * 100),
      watch_time_s: Math.round((Date.now() - sceneStartTime.current) / 1000),
    })
    setPhase('interact')
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

    track('qa_message_sent', {
      session_id: localStorage.getItem('dispatch_session'),
      episode_id: episode.id,
      message_length: text.length,
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
        { role: 'assistant', content: '[She pauses, looking away for a moment.]' },
      ])
    } finally {
      setLoading(false)
    }
  }

  async function handleVote(option) {
    castVote(episode.id, option.id, option.consequence)
    track('vote_cast', {
      session_id: localStorage.getItem('dispatch_session'),
      episode_id: episode.id,
      choice: option.id,
      time_since_scene_end_s: Math.round((Date.now() - sceneStartTime.current) / 1000),
    })

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

      {/* ─── SCENE: AUDIO + PORTRAIT + PROGRESSIVE TEXT ─── */}
      {phase === 'scene' && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            cursor: !userTapped ? 'pointer' : 'default',
          }}
          onClick={!userTapped ? handleTapToStart : undefined}
        >
          {/* Zoe portrait — fills upper portion */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: '55%',
            flexShrink: 0,
            overflow: 'hidden',
          }}>
            <img
              src={ZOE_IMAGE}
              alt="Zoe"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center top',
                filter: userTapped ? 'none' : 'brightness(0.6)',
                transition: 'filter 1s ease',
              }}
            />
            {/* Gradient fade into text area */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 120,
              background: 'linear-gradient(to top, #000 0%, transparent 100%)',
            }} />

            {/* Episode info overlay */}
            <div style={{
              position: 'absolute',
              top: 'max(16px, env(safe-area-inset-top))',
              left: 16,
              right: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div style={{
                fontSize: 11,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#f59e0b',
                fontWeight: 600,
              }}>
                DISPATCH
              </div>
              <div style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.5)',
              }}>
                Ep {episode.number} &middot; {episode.day_label}
              </div>
            </div>

            {/* Tap to start overlay */}
            {!userTapped && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                style={{
                  position: 'absolute',
                  bottom: 40,
                  left: 0,
                  right: 0,
                  textAlign: 'center',
                }}
              >
                <div style={{
                  fontSize: 22,
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  color: 'white',
                  marginBottom: 6,
                }}>
                  {episode.title}
                </div>
                <div style={{
                  fontSize: 14,
                  color: 'rgba(255,255,255,0.5)',
                  fontStyle: 'italic',
                  animation: 'pulse-text 2s ease-in-out infinite',
                }}>
                  Tap to listen
                </div>
              </motion.div>
            )}
          </div>

          {/* Scene text — scrolling area */}
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '0 24px 80px 24px',
            }}
          >
            {userTapped && sentences.slice(0, visibleSentences).map((sentence, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                  fontSize: 16,
                  lineHeight: 1.7,
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  color: i === visibleSentences - 1
                    ? 'rgba(255,255,255,0.9)'
                    : 'rgba(255,255,255,0.45)',
                  transition: 'color 0.8s ease',
                }}
              >
                {sentence}{' '}
              </motion.span>
            ))}
          </div>

          {/* Skip button — appears after 5s */}
          {userTapped && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 5, duration: 0.5 }}
              onClick={(e) => { e.stopPropagation(); skipScene() }}
              style={{
                position: 'absolute',
                bottom: 'max(24px, env(safe-area-inset-bottom))',
                right: 24,
                background: 'none',
                border: 'none',
                color: 'rgba(245,158,11,0.6)',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                zIndex: 2,
                letterSpacing: '0.03em',
              }}
            >
              Skip &rarr;
            </motion.button>
          )}

          <style>{`
            @keyframes pulse-text {
              0%, 100% { opacity: 0.4; }
              50% { opacity: 1; }
            }
          `}</style>
        </div>
      )}

      {/* ─── INTERACT: Q&A WITH ZOE ─── */}
      {phase === 'interact' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
          }}>
            <div style={{
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#f59e0b',
              fontWeight: 600,
            }}>
              DISPATCH
            </div>
            <div style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.35)',
            }}>
              Ep {episode.number} &middot; {episode.day_label}
            </div>
            <button
              onClick={() => setVoiceEnabled(voiceService.toggle())}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 4 }}
            >
              {voiceEnabled ? '\u{1F50A}' : '\u{1F507}'}
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
            {/* Zoe small portrait + name */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 16,
              paddingBottom: 16,
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <img
                src={ZOE_IMAGE}
                alt="Zoe"
                style={{ width: 40, height: 40, borderRadius: 20, objectFit: 'cover' }}
              />
              <div>
                <div style={{ fontSize: 15, color: 'white', fontWeight: 500 }}>{firstName}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{story.character_role}</div>
              </div>
            </div>

            {/* Scene summary (collapsed) */}
            <div style={{
              fontSize: 14,
              lineHeight: 1.6,
              fontStyle: 'italic',
              fontFamily: "Georgia, 'Times New Roman', serif",
              color: 'rgba(255,255,255,0.4)',
              marginBottom: 20,
              paddingBottom: 16,
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
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
                      style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Ready to vote nudge */}
            {exchangeCount >= 2 && exchangeCount < 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ textAlign: 'center', padding: '16px 0' }}
              >
                <button
                  onClick={() => setPhase('vote')}
                  style={{ background: 'none', border: 'none', color: '#f59e0b', fontSize: 14, cursor: 'pointer', fontWeight: 500 }}
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
                <div style={{ textAlign: 'center', paddingBottom: 8 }}>
                  <button
                    onClick={() => setPhase('vote')}
                    style={{ background: 'none', border: 'none', color: 'rgba(245,158,11,0.5)', fontSize: 12, cursor: 'pointer' }}
                  >
                    Skip to vote &rarr;
                  </button>
                </div>
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
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
                    }}
                    data-placeholder={'Ask ' + firstName + ' anything...'}
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
            position: 'relative',
          }}
        >
          {/* Subtle Zoe background */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url(' + ZOE_IMAGE + ')',
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            opacity: 0.08,
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* DISPATCH branding */}
            <div style={{
              fontSize: 11,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#f59e0b',
              fontWeight: 600,
              textAlign: 'center',
              marginBottom: 8,
            }}>
              DISPATCH
            </div>

            {/* Episode title */}
            <div style={{
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.3)',
              textAlign: 'center',
              marginBottom: 32,
            }}>
              Episode {episode.number} &middot; {episode.title}
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
                  {hasVoted && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: getPercent(option.id) + '%' }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                      style={{
                        position: 'absolute',
                        left: 0, top: 0, bottom: 0,
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
                      <div style={{ fontSize: 16, fontWeight: 500 }}>{option.label}</div>
                      {!hasVoted && (
                        <div style={{ fontSize: 13, fontStyle: 'italic', color: 'rgba(245,158,11,0.6)', marginTop: 2 }}>
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
                          color: votedOptionId === option.id ? '#f59e0b' : 'rgba(255,255,255,0.5)',
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
                style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 16 }}
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
                          track('share_tapped', { session_id: localStorage.getItem('dispatch_session'), episode_id: episode.id })
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
          </div>
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
