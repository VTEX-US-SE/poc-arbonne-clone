import type { CSSProperties } from 'react'

import styles from './SectionHeader.module.scss'
import type { SectionHeaderProps } from './SectionHeader.types'

/**
 * Centered headline + subtitle text block, no image or CTA. Covers any
 * plain section header on the homepage (e.g. "The Sweetest Strawberry Duo",
 * "Ready to Start Your Arbonne Journey?").
 */
export default function SectionHeader({
  headline,
  text,
  textColor = '#252525',
}: SectionHeaderProps) {
  return (
    <div
      className={styles.sectionHeader}
      style={{ '--fs-color-text': textColor } as CSSProperties}
    >
      {headline && (
        <h2 className={styles.sectionHeader__headline}>{headline}</h2>
      )}
      {text && <p className={styles.sectionHeader__text}>{text}</p>}
    </div>
  )
}
