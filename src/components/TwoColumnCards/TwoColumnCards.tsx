import type { CSSProperties } from 'react'
import { Link } from '@faststore/ui'

import styles from './TwoColumnCards.module.scss'
import type { TwoColumnCardsProps } from './TwoColumnCards.types'

function ArrowRightIcon() {
  return (
    <svg width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden="true">
      <path
        d="M8 1l5 5-5 5M13 6H1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Optional headline/subtitle above a responsive N-up grid of cards: image,
 * title, subtitle, description, and a "Shop Now"-style text link with a
 * trailing arrow -- a plain link CTA, not the pill Button used elsewhere.
 */
export default function TwoColumnCards({
  headline,
  text,
  textColor = '#252525',
  cards = [],
}: TwoColumnCardsProps) {
  return (
    <div
      className={styles.twoColumnCards}
      style={{ '--fs-color-text': textColor } as CSSProperties}
    >
      {(headline || text) && (
        <div className={styles.twoColumnCards__header}>
          {headline && (
            <h2 className={styles.twoColumnCards__headline}>{headline}</h2>
          )}
          {text && <p className={styles.twoColumnCards__headerText}>{text}</p>}
        </div>
      )}
      <div className={styles.twoColumnCards__grid}>
        {cards.map((card, index) => (
          <div className={styles.twoColumnCards__card} key={index}>
            {card.image && (
              <img
                className={styles.twoColumnCards__image}
                src={card.image}
                alt={card.imageAlt ?? ''}
              />
            )}
            {card.title && (
              <p className={styles.twoColumnCards__title}>{card.title}</p>
            )}
            {card.subtitle && (
              <p className={styles.twoColumnCards__subtitle}>
                {card.subtitle}
              </p>
            )}
            {card.description && (
              <p className={styles.twoColumnCards__description}>
                {card.description}
              </p>
            )}
            {card.link?.url && card.link?.text && (
              <Link
                className={styles.twoColumnCards__link}
                href={card.link.url}
              >
                {card.link.text}
                <ArrowRightIcon />
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
