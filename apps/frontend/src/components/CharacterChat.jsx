import posthog from 'posthog-js'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ERA_CHARACTERS, getCharacterForEra } from '../data/era-characters'
import { getQuestPrompts } from '../data/engagement'
import { sendCharacterMessage } from '../services/characterService'
import { voiceService } from '../services/voiceService'
import useStore from '../store/useStore'

function trailPromptToQuestion(prompt = '') {
  const cleaned = prompt.trim()
  const question = cleaned.replace(
    /^Ask\s+.+?\s+(who|what|where|how|why|when)\b/i,
    (_, word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`
  )
  if (question === cleaned) return cleaned
  return question.replace(/[.]+$/, '?')
}

export function CharacterChat({ era, onDismiss, character: characterProp, venueContext, backLabel, sceneIntro, trailContext }) {
  const character = characterProp || getCharacterForEra(era?.id)
  // If sceneIntro provided, skip straight to chat with the intro as first message
  const [phase, setPhase] = useState(sceneIntro ? 'chat' : 'notification')
  // phases: notification → introduction → chat
  const [messages, setMessages] = useState(
    sceneIntro ? [{ role: 'assistant', content: sceneIntro }] : []
  )
  const [loading, setLoading] = useState(false)
  // Voice disabled, default TTS voices don't match character demographics
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const awardStamp = useStore((s) => s.awardStamp)
  const questPrompts = getQuestPrompts(character, era)
  const trailQuestion = trailContext?.prompt ? trailPromptToQuestion(trailContext.prompt) : null
  const visiblePrompts = trailQuestion
    ? [trailQuestion, ...questPrompts.filter((prompt) => prompt !== trailQuestion)].slice(0, 3)
    : questPrompts.slice(0, 3)

  // Auto-scroll to latest message
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

  // Disable autocorrect on contenteditable via DOM attributes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.setAttribute('spellcheck', 'false')
      inputRef.current.setAttribute('autocorrect', 'off')
      inputRef.current.setAttribute('autocomplete', 'off')
    }
  }, [])

  if (!character) return null

  async function handleSend(overrideText = null) {
    const text = (overrideText || inputRef.current?.innerText || '').trim()
    if (!text || loading) return

    if (inputRef.current) inputRef.current.innerText = ''
    const userMessage = text
    setLoading(true)

    const newMessages = [
      ...messages,
      { role: 'user', content: userMessage }
    ]
    setMessages(newMessages)
    posthog.capture('character_message', { zone_id: era?.id?.split('-').slice(0, -1).join('-'), character_id: character?.name, message_length: userMessage.length })

    try {
      const response = await sendCharacterMessage(
        character,
        messages,
        userMessage,
        venueContext
      )
      setMessages([
        ...newMessages,
        { role: 'assistant', content: response }
      ])
      awardStamp({
        id: `quest:${character.id || character.name}:${era?.id || 'concierge'}`,
        type: 'quest',
        label: `Spoke with ${character.name}`,
        detail: era?.label,
      })
      // Voice disabled for now, voiceService.speak(response, era?.id)
    } catch (err) {
      console.error('Character chat failed:', err)
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'I am having trouble hearing you through the noise of the room. Try that once more?'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  // Phase 1: Notification pill
  if (phase === 'notification') {
    return (
      <motion.div
        className="absolute inset-x-0 z-30 flex justify-center mobile-frame"
        style={{ bottom: 180 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
      >
        <button
          onClick={() => setPhase('introduction')}
          className="flex cursor-pointer items-center gap-2 rounded-full border border-past/30 bg-black/80 px-5 py-3 font-ui text-sm text-white backdrop-blur-sm transition-all duration-300 hover:border-past/60"
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-past" />
          Someone wants to speak with you
        </button>
      </motion.div>
    )
  }

  // Phase 2: Character introduction
  if (phase === 'introduction') {
    return (
      <motion.div
        className="absolute inset-0 z-40 flex flex-col justify-end mobile-frame"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="relative rounded-t-2xl border-t border-white/10 bg-black/90 p-6 backdrop-blur-md">
          {/* Dismiss */}
          <button
            onClick={onDismiss}
            className="absolute right-4 top-4 cursor-pointer font-ui text-xl text-white/45 transition-colors hover:text-white/75"
          >
            &times;
          </button>

          {/* Character identity */}
          <div className="mb-4">
            <div className="mb-1 font-ui text-xs tracking-widest text-past uppercase">
              {era.year_display} &middot; {era.label}
            </div>
            <div className="mb-1 font-heading text-xl text-white">
              {character.name}
            </div>
            <div className="font-ui text-sm text-white/55">
              {character.role}
            </div>
          </div>

          {/* Opening line */}
          <div className="mb-5 rounded-xl border border-white/10 bg-white/[0.06] p-4 font-ui text-sm italic leading-relaxed text-white/90">
            &ldquo;{character.opening_line}&rdquo;
          </div>

          {/* Begin conversation */}
          <button
            onClick={() => {
              setMessages([{
                role: 'assistant',
                content: character.opening_line
              }])
              setPhase('chat')
            }}
            className="w-full cursor-pointer rounded-xl bg-past py-3 font-ui text-sm font-medium text-background transition-colors duration-200 hover:bg-past/80"
          >
            Speak with {character.name.split(' ')[0]}
          </button>
        </div>
      </motion.div>
    )
  }

  // Phase 3: Chat interface
  return (
    <motion.div
      className="mobile-frame"
      style={{
        position: 'fixed',
        top: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#000',
        width: '100%',
        overflow: 'hidden',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header with safe area */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 'max(14px, env(safe-area-inset-top))',
          paddingLeft: 16,
          paddingRight: 16,
          paddingBottom: 12,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          backgroundColor: '#000',
        }}
      >
        <button
          onClick={() => { voiceService.stop(); onDismiss() }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.78)', fontSize: 13, maxWidth: 188, textAlign: 'left' }}
        >
          <span>&larr;</span>
          <span>{backLabel ? `Back to ${backLabel}` : `Back to ${era.label}`}</span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{character.name}, {era.year_display}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto overflow-x-hidden p-4">
        {trailContext && (
          <div className="rounded-2xl border border-past/35 bg-past/10 p-3">
            <div className="font-ui text-[10px] tracking-[0.16em] text-past uppercase">
              Trail checkpoint
            </div>
            <div className="mt-1 font-heading text-sm text-white">
              {trailContext.stopTitle}
            </div>
            <p className="mt-1 font-ui text-xs leading-relaxed text-white/65">
              Ask the question, then continue to the next stop when you are ready.
            </p>
          </div>
        )}

        {visiblePrompts.length > 0 && messages.length <= 1 && (
          <div className="rounded-2xl border border-white/14 bg-white/[0.06] p-3">
            <div className="font-ui text-[10px] tracking-[0.16em] text-past uppercase">
              {trailContext ? 'Suggested question' : 'Character quest'}
            </div>
            <div className="mt-2 flex flex-col gap-2">
              {visiblePrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="rounded-xl border border-past/35 bg-past/15 px-3 py-2 text-left font-ui text-xs leading-relaxed text-white"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] break-words rounded-2xl px-4 py-3 font-ui text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'border border-past/40 bg-past/20 text-white'
                  : 'border border-white/12 bg-white/[0.08] text-white/88'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-white/12 bg-white/[0.08] px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {trailContext?.nextHref && messages.length > 1 && !loading && (
          <a
            href={trailContext.nextHref}
            className="block rounded-2xl border border-past/35 bg-past/15 px-4 py-3 font-ui text-sm font-medium text-past"
          >
            Continue to {trailContext.nextLabel}
          </a>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input row */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 16px',
          paddingRight: 'max(16px, env(safe-area-inset-right, 16px))',
          paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
          backgroundColor: '#111',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 1,
        }}
      >
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
          data-placeholder={`Ask ${character.name.split(' ')[0]} anything...`}
          style={{
            flex: 1,
            minWidth: 0,
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '24px',
            padding: '10px 16px',
            color: 'white',
            fontSize: '15px',
            outline: 'none',
            minHeight: '20px',
            maxHeight: '80px',
            overflowY: 'auto',
            wordBreak: 'break-word',
          }}
        />
        <button
          onMouseDown={(e) => { e.preventDefault(); handleSend() }}
          style={{
            flexShrink: 0,
            width: '44px',
            height: '44px',
            borderRadius: '22px',
            backgroundColor: '#b45309',
            border: 'none',
            color: 'white',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          &rarr;
        </button>
      </div>

      <div className="py-2 text-center">
        <span className="font-ui text-[9px] tracking-[0.15em] text-white/20 uppercase">
          Powered by Phunware AI
        </span>
      </div>
    </motion.div>
  )
}
