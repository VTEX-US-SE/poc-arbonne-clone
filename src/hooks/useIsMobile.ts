import { useEffect, useState } from 'react'

const MOBILE_QUERY = '(max-width: 63.9375rem)'

/**
 * Tracks this site's own 1024px breakpoint. Core's `useScreenResize` cannot be
 * reused: its thresholds are 420/768/1280 and none of them match this site.
 *
 * Returns `false` during SSR and the first client render, so anything gated on
 * it must be interaction-driven rather than part of the initial markup.
 */
export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY)
    const update = () => setIsMobile(query.matches)

    update()
    query.addEventListener('change', update)

    return () => query.removeEventListener('change', update)
  }, [])

  return isMobile
}
