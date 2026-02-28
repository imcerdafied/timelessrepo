import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'timeless_gyro_granted'

export function useGyroscope() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [supported, setSupported] = useState(false)
  const [needsPermission, setNeedsPermission] = useState(false)

  const handleOrientation = useCallback((e) => {
    // gamma = left/right tilt (-90 to 90)
    // beta = front/back tilt (-180 to 180), offset by 45 for natural phone hold
    const x = Math.max(-20, Math.min(20, e.gamma || 0))
    const y = Math.max(-20, Math.min(20, (e.beta || 0) - 45))
    setTilt({ x, y })
  }, [])

  const requestPermission = useCallback(async () => {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceOrientationEvent.requestPermission()
        if (permission !== 'granted') return
        localStorage.setItem(STORAGE_KEY, '1')
      } catch {
        return
      }
    }
    setSupported(true)
    setNeedsPermission(false)
    window.addEventListener('deviceorientation', handleOrientation)
  }, [handleOrientation])

  useEffect(() => {
    if (!window.DeviceOrientationEvent) return

    // iOS 13+ requires user gesture for permission
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      // Already granted in a previous session
      if (localStorage.getItem(STORAGE_KEY)) {
        requestPermission()
      } else {
        setNeedsPermission(true)
      }
    } else {
      // Android / desktop — no permission needed
      setSupported(true)
      window.addEventListener('deviceorientation', handleOrientation)
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation)
    }
  }, [handleOrientation, requestPermission])

  // Desktop mouse fallback
  useEffect(() => {
    if (supported) return

    const handleMouse = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20
      const y = (e.clientY / window.innerHeight - 0.5) * 20
      setTilt({ x, y })
    }

    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [supported])

  return { tilt, supported, needsPermission, requestPermission }
}
