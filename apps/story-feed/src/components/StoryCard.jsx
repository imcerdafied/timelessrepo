import { motion } from 'framer-motion'

const UNSPLASH_BASE = 'https://source.unsplash.com/800x600/?'

export default function StoryCard({ story, onPlay }) {
  const episodeCount = story.episodes.length
  const imageUrl = `${UNSPLASH_BASE}${encodeURIComponent(story.cover_image_query)}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onClick={() => onPlay(story)}
      style={{
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 16,
        cursor: 'pointer',
        backgroundColor: '#111',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Cover image */}
      <div style={{ position: 'relative', height: 220, overflow: 'hidden' }}>
        <img
          src={imageUrl}
          alt={story.title}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.6)',
          }}
        />
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)',
        }} />
        {/* Location + year pill */}
        <div style={{
          position: 'absolute',
          top: 12,
          left: 12,
          display: 'flex',
          gap: 6,
        }}>
          <span style={{
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            padding: '4px 10px',
            borderRadius: 999,
            fontSize: 11,
            color: '#C8860A',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            border: '1px solid rgba(200,134,10,0.2)',
          }}>
            {story.location} &middot; {story.year}
          </span>
        </div>
        {/* Episode count */}
        <div style={{
          position: 'absolute',
          top: 12,
          right: 12,
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          padding: '4px 10px',
          borderRadius: 999,
          fontSize: 11,
          color: 'rgba(255,255,255,0.5)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          {episodeCount} {episodeCount === 1 ? 'episode' : 'episodes'}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px 16px 20px' }}>
        <div style={{
          fontSize: 22,
          fontWeight: 600,
          fontFamily: "'Playfair Display', serif",
          color: 'white',
          marginBottom: 4,
        }}>
          {story.title}
        </div>
        <div style={{
          fontSize: 13,
          color: 'rgba(255,255,255,0.5)',
          marginBottom: 10,
        }}>
          {story.character} &middot; {story.role}
        </div>
        <div style={{
          fontSize: 14,
          color: 'rgba(255,255,255,0.7)',
          fontStyle: 'italic',
          lineHeight: 1.5,
          marginBottom: 16,
        }}>
          {story.tagline}
        </div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          backgroundColor: '#C8860A',
          color: '#000',
          padding: '10px 20px',
          borderRadius: 12,
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: '0.02em',
        }}>
          Watch Episode 1
          <span style={{ fontSize: 16 }}>&rarr;</span>
        </div>
      </div>
    </motion.div>
  )
}
