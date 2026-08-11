import { useEffect } from 'react'

/**
 * FastStore's own scroll lock only fires through its `useUI()` reducer
 * actions (openModal/closeModal) -- our modals manage local `open` state
 * directly, so it never triggers for them. This does the same job
 * (document.body.style.overflow) scoped to just these components.
 */
export default function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [locked])
}
