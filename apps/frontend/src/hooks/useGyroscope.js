import { useState, useEffect, useCallback, useRef } from 'react'

const STORAGE_KEY = 'gyro_permission'

export function useGyroscope() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [supported, setSupported] = useState(false)
  const [needsPermission, setNeedsPermission] = useState(false)
  const listenerAttached = useRef(false)

  const handleOrientation = useCallback((e) => {
    // gamma = left/right tilt (-90 to 90)
    // beta = front/back tilt (-180 to 180), offset by 45 for natural phone hold
    const x = Math.max(-20, Math.min(20, e.gamma || 0))
    const y = Math.max(-20, Math.min(20, (e.beta || 0) - 45))
    setTilt({ x, y })
  }, [])

  const attachListener = useCallback(() => {
    if (listenerAttached.current) return
    listenerAttached.current = true
    setSupported(true)
    setNeedsPermission(false)
    window.addEventListener('deviceorientation', handleOrientation)
  }, [handleOrientation])

  // Called directly from onClick — MUST be synchronous for iOS gesture handler
  const requestPermission = useCallback(() => {
    if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then((result) => {
          if (result === 'granted') {
            localStorage.setItem(STORAGE_KEY, 'granted')
            attachListener()
          }
        })
        .catch(() => {})
    } else {
      localStorage.setItem(STORAGE_KEY, 'granted')
      attachListener()
    }
  }, [attachListener])

  useEffect(() => {
    if (!window.DeviceOrientationEvent) return

    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      // iOS 13+ — check if already granted
      if (localStorage.getItem(STORAGE_KEY) === 'granted') {
        attachListener()
      } else {
        setNeedsPermission(true)
      }
    } else {
      // Android / non-iOS — no permission needed
      attachListener()
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation)
      listenerAttached.current = false
    }
  }, [handleOrientation, attachListener])

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
