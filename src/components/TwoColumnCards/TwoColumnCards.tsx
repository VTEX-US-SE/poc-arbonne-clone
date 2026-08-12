import type { CSSProperties } from 'react'
import {
  Image_unstable as Image,
  // @ts-ignore next-line
} from '@faststore/core/experimental'
import { Icon } from '@faststore/ui'

import Button from '../Button/Button'
import styles from './TwoColumnCards.module.scss'
import type { TwoColumnCardsProps } from './TwoColumnCards.types'

/**
 * Optional headline/subtitle above a responsive N-up grid of cards: image,
 * title, subtitle, description, and a borderless text-link CTA with a
 * trailing arrow (Button's "borderless" color scheme).
 */
export default function TwoColumnCards({
  headline,
  text,
  textColor = 'var(--arb-color-text)',
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
              <Image
                className={styles.twoColumnCards__image}
                src={card.image}
                alt={card.imageAlt ?? ''}
                width={600}
                height={600}
                sizes="(min-width: 64rem) 600px, 100vw"
              />
            )}
            {card.title && (
              <p className={styles.twoColumnCards__title}>{card.title}</p>
            )}
            {card.subtitle && (
              <p className={styles.twoColumnCards__subtitle}>{card.subtitle}</p>
            )}
            {card.description && (
              <p className={styles.twoColumnCards__description}>
                {card.description}
              </p>
            )}
            {card.link?.url && card.link?.text && (
              <Button
                className={styles.twoColumnCards__link}
                href={card.link.url}
                colorScheme="borderless"
                icon={<Icon name="ArrowRight" width={14} height={12} />}
                iconPosition="right"
              >
                {card.link.text}
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
