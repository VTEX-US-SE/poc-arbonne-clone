import { Icon } from '@faststore/ui'

import BaseModal from '../../BaseModal/BaseModal'
import Button from '../../Button/Button'
import styles from './SponsorPanel.module.scss'
import type { SponsorPanelProps } from './SponsorPanel.types'

/**
 * What the header badge opens: who this consultant is, a way to their page, and
 * the way out of the attribution.
 *
 * The opt-out lives here rather than in the badge so the header stays two lines
 * like production -- it is a deliberate action, not something to advertise
 * beside the logo.
 *
 * A popover anchored under the badge rather than a `BaseModal`: it belongs to
 * the badge, and a centred dialog for "who is my consultant" is heavier than
 * the question. Dismissal is owned by `SponsorBadge`, which knows what counts
 * as outside.
 */
export default function SponsorPanel({
  open,
  asModal = false,
  onClose,
  onClear,
  arbonneId,
  displayName,
  profilePicture,
}: SponsorPanelProps) {
  if (!open) {
    return null
  }

  const content = (
    <>
      <div className={styles.sponsorPanel__banner}>
        <button
          aria-label="Close"
          className={styles.sponsorPanel__close}
          onClick={onClose}
          type="button"
        >
          <Icon name="X" width={20} height={20} />
        </button>

        <span className={styles.sponsorPanel__avatar}>
          {profilePicture && <img src={profilePicture} alt="" />}
        </span>

        <p className={styles.sponsorPanel__greeting}>
          Hey there, it&apos;s {displayName}.
        </p>
        <p className={styles.sponsorPanel__label}>
          Your Independant Consultant
        </p>

        <Button
          className={styles.sponsorPanel__cta}
          colorScheme="white"
          href={`/shop-with?sponsor=${encodeURIComponent(arbonneId)}`}
        >
          VIEW MY HOME PAGE
        </Button>
      </div>

      <div className={styles.sponsorPanel__footer}>
        <button
          className={styles.sponsorPanel__clear}
          onClick={() => {
            onClear()
            onClose()
          }}
          type="button"
        >
          Not your consultant?
        </button>
      </div>
    </>
  )

  // On a phone this becomes a real modal, which brings its own backdrop,
  // Escape and scroll lock -- `SponsorBadge` stands its own dismissal down when
  // it hands over.
  if (asModal) {
    return (
      <BaseModal
        ariaLabel="Your Independant Consultant"
        className={`${styles.sponsorPanel} ${styles['sponsorPanel--modal']}`}
        onClose={onClose}
        open={open}
      >
        {content}
      </BaseModal>
    )
  }

  return (
    <div
      aria-label="Your Independant Consultant"
      className={styles.sponsorPanel}
      role="dialog"
    >
      {content}
    </div>
  )
}
