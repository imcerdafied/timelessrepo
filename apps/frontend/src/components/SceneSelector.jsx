import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * SceneSelector — shows available scenes as cards when user enters an era
 * with pre-generated content. Renders as a bottom sheet overlay.
 *
 * Props:
 *   scenes: array of scene data objects
 *   onSelect: (scene) => void — called when user taps a scene to watch
 *   onClose: () => void
 *   visible: boolean
 */
export default function SceneSelector({ scenes, onSelect, onClose, visible }) {
  if (!visible || !scenes?.length) return null

  return createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40"
          style={{ background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(12px)' }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <span className="text-white/60 text-lg">✕</span>
          </button>

          {/* Content */}
          <div className="h-full flex flex-col px-5 pt-16 pb-8 overflow-y-auto" style={{ maxWidth: 600, margin: '0 auto', width: '100%' }}>
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <p
                className="text-[10px] tracking-[0.2em] uppercase mb-2"
                style={{ color: '#C8860A' }}
              >
                San Francisco, 1906
              </p>
              <h1
                className="text-2xl mb-1 font-semibold"
                style={{ fontFamily: 'Playfair Display, serif', color: '#F5F5F5' }}
              >
                The Great Earthquake
              </h1>
              <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Two survivors. One day that changed everything. Watch their story unfold.
              </p>
            </motion.div>

            {/* Scene cards */}
            <div className="flex flex-col gap-4">
              {scenes.map((scene, index) => (
                <SceneCard
                  key={scene.sceneId}
                  scene={scene}
                  index={index}
                  onSelect={() => onSelect(scene)}
                />
              ))}
            </div>

            {/* Characters section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 pt-6"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <p className="text-[10px] tracking-[0.15em] uppercase mb-4" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Characters
              </p>
              <div className="flex gap-4">
                {scenes[0]?.characters?.map((char) => (
                  <div key={char.id} className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${char.portraitUrl})`,
                        border: '1.5px solid rgba(200,134,10,0.3)',
                      }}
                    />
                    <div>
                      <p className="text-xs font-medium" style={{ color: '#F5F5F5' }}>
                        {char.name}
                      </p>
                      <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {char.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Vision tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-auto pt-8 text-center text-[10px] tracking-[0.15em] uppercase"
              style={{ color: 'rgba(255,255,255,0.15)' }}
            >
              Timeless Moment — AI-Generated Historical Drama
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

function SceneCard({ scene, index, onSelect }) {
  const isVideo = scene.mode === 'video'
  const episodeNum = index + 1
  const lineCount = scene.script?.length || 0

  // Time estimate
  const timeLabels = { video: 'Video', audio: 'Audio + Portraits', cinematic: 'Cinematic' }

  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.15 }}
      onClick={onSelect}
      className="w-full text-left rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Top section with episode number and time indicator */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] tracking-[0.15em] uppercase font-medium"
              style={{ color: '#C8860A' }}
            >
              Episode {episodeNum}
            </span>
            <span
              className="text-[9px] px-2 py-0.5 rounded-full"
              style={{
                background: isVideo ? 'rgba(200,134,10,0.15)' : scene.mode === 'cinematic' ? 'rgba(180,100,50,0.15)' : 'rgba(100,140,200,0.15)',
                color: isVideo ? '#C8860A' : scene.mode === 'cinematic' ? '#D4956A' : '#8BAED4',
                border: `1px solid ${isVideo ? 'rgba(200,134,10,0.2)' : scene.mode === 'cinematic' ? 'rgba(180,100,50,0.2)' : 'rgba(100,140,200,0.2)'}`,
              }}
            >
              {timeLabels[scene.mode] || 'Video'}
            </span>
          </div>
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
            {lineCount} lines
          </span>
        </div>

        {/* Title */}
        <h3
          className="text-lg font-semibold mb-1"
          style={{ fontFamily: 'Playfair Display, serif', color: '#F5F5F5' }}
        >
          {scene.title}
        </h3>

        {/* Date & location */}
        <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {scene.date}
        </p>

        {/* Setting preview */}
        <p
          className="text-xs leading-relaxed line-clamp-2"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          {scene.setting}
        </p>
      </div>

      {/* Play CTA bar */}
      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{
          background: 'rgba(200,134,10,0.08)',
          borderTop: '1px solid rgba(200,134,10,0.1)',
        }}
      >
        <span className="text-sm font-medium" style={{ color: '#C8860A' }}>
          {isVideo ? '▶ Watch Scene' : scene.mode === 'cinematic' ? '▶ Experience Scene' : '▶ Listen & Watch'}
        </span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 3l5 5-5 5" stroke="#C8860A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </motion.button>
  )
}

