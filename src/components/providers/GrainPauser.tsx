'use client'

import { useEffect } from 'react'

// Mounts the CSS film grain overlay (via `data-grain` on body, see globals.css)
// and pauses its animation when the browser tab is hidden to save CPU/battery.
// Only rendered inside the (site) route group, so /admin (Sanity Studio) never gets it.
export default function GrainPauser() {
  useEffect(() => {
    document.body.setAttribute('data-grain', 'true')

    const sync = () => {
      document.body.classList.toggle('grain-paused', document.visibilityState === 'hidden')
    }
    document.addEventListener('visibilitychange', sync)
    return () => {
      document.removeEventListener('visibilitychange', sync)
      document.body.removeAttribute('data-grain')
    }
  }, [])

  return null
}
