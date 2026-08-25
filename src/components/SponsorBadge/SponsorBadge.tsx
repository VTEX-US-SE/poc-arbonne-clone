import { useEffect, useRef, useState } from 'react'

import useIsMobile from '../../hooks/useIsMobile'
import useSponsorAttribution from '../../hooks/useSponsorAttribution'
import SponsorPanel from './SponsorPanel/SponsorPanel'
import styles from './SponsorBadge.module.scss'
import type { SponsorBadgeProps } from './SponsorBadge.types'

/**
 * Who this visit is attributed to, in the header.
 *
 * Reads the same resolution the order attribution uses, so what a shopper sees
 * here is who gets credited -- a badge naming one consultant while another is
 * stamped on the cart would be the worst failure this feature has.
 *
 * The badge triggers `SponsorPanel`, which holds the consultant's page and the
 * opt-out. Keeping those out of the header is what lets it stay two lines.
 */
export default function SponsorBadge({
  variant = 'compact',
}: SponsorBadgeProps) {
  const { arbonneId, sponsor, loading, clear } = useSponsorAttribution()
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Dismissal lives here rather than in the panel because this is the component
  // that knows what counts as "outside".
  //
  // Stood down on mobile: there the panel is a modal, which owns its own
  // backdrop and Escape -- and it renders in a portal, so every click inside it
  // would read as outside this component and close it immediately.
  useEffect(() => {
    if (!open || isMobile) {
      return
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        // Escape without this leaves focus on a node that is gone.
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, isMobile])

  if (loading || !sponsor) {
    return null
  }

  return (
    <div className={styles.sponsorBadge__root} ref={rootRef}>
      <button
        aria-expanded={open}
        className={[
          styles.sponsorBadge,
          variant === 'strip' ? styles['sponsorBadge--strip'] : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={() => setOpen((current) => !current)}
        ref={triggerRef}
        type="button"
      >
        {variant === 'strip' ? (
          <>
            <span className={styles.sponsorBadge__side}>
              <span className={styles.sponsorBadge__sideName}>
                {sponsor.displayName}
              </span>
              <span className={styles.sponsorBadge__sideId}>{arbonneId}</span>
            </span>

            <span className={styles.sponsorBadge__avatar}>
              {sponsor.profilePicture && (
                <img src={sponsor.profilePicture} alt="" />
              )}
            </span>

            <span className={styles.sponsorBadge__side}>
              Independant Consultant
            </span>
          </>
        ) : (
          <>
            <span className={styles.sponsorBadge__avatar}>
              {sponsor.profilePicture && (
                <img src={sponsor.profilePicture} alt="" />
              )}
            </span>

            <span className={styles.sponsorBadge__text}>
              <span className={styles.sponsorBadge__label}>
                Your Independant Consultant
              </span>
              <span className={styles.sponsorBadge__name}>
                {sponsor.displayName} {arbonneId}
              </span>
            </span>
          </>
        )}
      </button>

      <SponsorPanel
        arbonneId={arbonneId}
        asModal={isMobile}
        displayName={sponsor.displayName}
        onClear={clear}
        onClose={() => setOpen(false)}
        open={open}
        profilePicture={sponsor.profilePicture}
      />
    </div>
  )
}
