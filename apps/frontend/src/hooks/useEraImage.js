import { useState, useEffect } from 'react'
import { getCuratedImage, isBleTriggered } from '../data/imageMap'

const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY
const unsplashCache = {}

function fetchUnsplash(query) {
  if (!UNSPLASH_KEY) return Promise.resolve(null)
  if (unsplashCache[query]) return Promise.resolve(unsplashCache[query])

  return fetch(
    `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=portrait&client_id=${UNSPLASH_KEY}`
  )
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (!data) return null
      const result = {
        url: data.urls.regular,
        credit: data.user.name,
        creditUrl: data.user.links.html,
      }
      unsplashCache[query] = result
      return result
    })
    .catch(() => null)
}

/**
 * Returns { url, credit, creditUrl, bleTriggered } for a given era.
 * Resolution order: curated → Unsplash (if key + image_query) → Picsum fallback.
 */
export function useEraImage(era) {
  const [unsplash, setUnsplash] = useState(null)

  const eraId = era?.id
  const imageQuery = era?.image_query
  const curatedUrl = getCuratedImage(eraId)
  const hasCurated = !!curatedUrl
  const bleTriggered = isBleTriggered(eraId)

  useEffect(() => {
    if (!eraId || hasCurated || !UNSPLASH_KEY || !imageQuery) return
    let cancelled = false
    fetchUnsplash(imageQuery).then((result) => {
      if (!cancelled && result) setUnsplash(result)
    })
    return () => { cancelled = true }
  }, [eraId, hasCurated, imageQuery])

  if (!era) return { url: null, credit: null, creditUrl: null, bleTriggered: false }

  // 1. Curated
  if (hasCurated) {
    return { url: curatedUrl, credit: null, creditUrl: null, bleTriggered }
  }

  // 2. Unsplash
  if (unsplash) {
    return { ...unsplash, bleTriggered }
  }

  // 3. Picsum fallback
  return {
    url: `https://picsum.photos/seed/${eraId}/1080/1920`,
    credit: null,
    creditUrl: null,
    bleTriggered,
  }
}
