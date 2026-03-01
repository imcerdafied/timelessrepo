import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ERA_CHARACTERS } from '../data/era-characters'
import { sendCharacterMessage } from '../services/characterService'

export function CharacterChat({ era, onDismiss }) {
  const character = ERA_CHARACTERS[era?.id]
  const [phase, setPhase] = useState('notification')
  // phases: notification → introduction → chat
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!character) return null

  async function handleSend() {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setLoading(true)

    const newMessages = [
      ...messages,
      { role: 'user', content: userMessage }
    ]
    setMessages(newMessages)

    try {
      const response = await sendCharacterMessage(
        character,
        messages,
        userMessage
      )
      setMessages([
        ...newMessages,
        { role: 'assistant', content: response }
      ])
    } catch (err) {
      const errorMsg = err.message || 'Unknown error'
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: `[Error: ${errorMsg}]`
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
        className="absolute inset-x-0 z-30 flex justify-center"
        style={{ bottom: 180 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
      >
        <button
          onClick={() => setPhase('introduction')}
          className="flex cursor-pointer items-center gap-2 rounded-full border border-past/30 bg-black/80 px-5 py-3 font-ui text-sm text-present backdrop-blur-sm transition-all duration-300 hover:border-past/60"
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
        className="absolute inset-0 z-40 flex flex-col justify-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="relative rounded-t-2xl border-t border-present/10 bg-black/90 p-6 backdrop-blur-md">
          {/* Dismiss */}
          <button
            onClick={onDismiss}
            className="absolute right-4 top-4 cursor-pointer font-ui text-xl text-present/40 transition-colors hover:text-present/70"
          >
            &times;
          </button>

          {/* Character identity */}
          <div className="mb-4">
            <div className="mb-1 font-ui text-xs tracking-widest text-past uppercase">
              {era.year_display} &middot; {era.label}
            </div>
            <div className="mb-1 font-heading text-xl text-present">
              {character.name}
            </div>
            <div className="font-ui text-sm text-present/50">
              {character.role}
            </div>
          </div>

          {/* Opening line */}
          <div className="mb-5 rounded-xl border border-present/10 bg-present/5 p-4 font-ui text-sm italic leading-relaxed text-present/90">
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
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        boxSizing: 'border-box',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#000',
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
          paddingTop: 'max(16px, env(safe-area-inset-top))',
          paddingLeft: 16,
          paddingRight: 16,
          paddingBottom: 12,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          backgroundColor: '#000',
        }}
      >
        <button
          onClick={onDismiss}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', fontSize: 14 }}
        >
          <span>&larr;</span>
          <span>Back to {era.label}</span>
        </button>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{character.name}, {era.year_display}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 font-ui text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'border border-past/30 bg-past/20 text-present'
                  : 'border border-present/10 bg-present/[0.08] italic text-present/90'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-present/10 bg-present/[0.08] px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-present/40"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input row */}
      <div
        role="search"
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          backgroundColor: '#111',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          padding: 12,
          paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <input
          type="text"
          inputMode="text"
          style={{
            flex: 1,
            minWidth: 0,
            maxWidth: 'calc(100% - 56px)',
            boxSizing: 'border-box',
            borderRadius: 9999,
            backgroundColor: 'rgba(255,255,255,0.1)',
            padding: '12px 16px',
            fontSize: 14,
            color: '#fff',
            outline: 'none',
            border: 'none',
          }}
          placeholder={`Ask ${character.name.split(' ')[0]} anything...`}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          data-form-type="other"
          data-lpignore="true"
        />
        <button
          style={{
            width: 44,
            height: 44,
            flexShrink: 0,
            borderRadius: 22,
            backgroundColor: '#b45309',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: loading || !input.trim() ? 0.3 : 1,
          }}
          onClick={handleSend}
          disabled={loading || !input.trim()}
        >
          <span style={{ fontSize: 18, lineHeight: 1, color: '#fff' }}>&rarr;</span>
        </button>
      </div>
    </motion.div>
  )
}
