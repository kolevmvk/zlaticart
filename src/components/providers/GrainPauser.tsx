'use client'

import { useEffect } from 'react'

// Pauses the CSS film grain animation when the browser tab is hidden.
// Saves CPU/battery on mobile without any visible change to the user.
export default function GrainPauser() {
  useEffect(() => {
    const sync = () => {
      document.body.classList.toggle('grain-paused', document.visibilityState === 'hidden')
    }
    document.addEventListener('visibilitychange', sync)
    return () => document.removeEventListener('visibilitychange', sync)
  }, [])

  return null
}
