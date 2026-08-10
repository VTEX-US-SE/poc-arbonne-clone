import { Link } from '@faststore/ui'

import styles from './ProductCardGrid.module.scss'
import type { ProductCardGridProps } from './ProductCardGrid.types'

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
 * Responsive N-up grid of product/promo cards: image, title, subtitle,
 * description, and a "Shop Now"-style text link with a trailing arrow --
 * a plain link CTA, not the pill Button used elsewhere.
 */
export default function ProductCardGrid({ cards = [] }: ProductCardGridProps) {
  return (
    <div className={styles.productCardGrid}>
      {cards.map((card, index) => (
        <div className={styles.productCardGrid__card} key={index}>
          {card.image && (
            <img
              className={styles.productCardGrid__image}
              src={card.image}
              alt={card.imageAlt ?? ''}
            />
          )}
          {card.title && (
            <p className={styles.productCardGrid__title}>{card.title}</p>
          )}
          {card.subtitle && (
            <p className={styles.productCardGrid__subtitle}>{card.subtitle}</p>
          )}
          {card.description && (
            <p className={styles.productCardGrid__description}>
              {card.description}
            </p>
          )}
          {card.link?.url && card.link?.text && (
            <Link className={styles.productCardGrid__link} href={card.link.url}>
              {card.link.text}
              <ArrowRightIcon />
            </Link>
          )}
        </div>
      ))}
    </div>
  )
}
