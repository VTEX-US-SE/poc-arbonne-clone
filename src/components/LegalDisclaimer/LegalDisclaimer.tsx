import styles from './LegalDisclaimer.module.scss'
import type { LegalDisclaimerProps } from './LegalDisclaimer.types'

/**
 * Bordered, centered legal/regulatory footnote box (e.g. the FDA
 * disclaimer following a "◊"-marked claim). Generic text prop since this
 * pattern recurs with different disclaimer copy across the site.
 */
export default function LegalDisclaimer({ text }: LegalDisclaimerProps) {
  if (!text) {
    return null
  }

  return (
    <div className={styles.legalDisclaimer}>
      <p className={styles.legalDisclaimer__text}>{text}</p>
    </div>
  )
}
