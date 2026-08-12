import type { CSSProperties } from 'react'
import {
  Image_unstable as Image,
  // @ts-ignore next-line
} from '@faststore/core/experimental'

import styles from './ImageOverlayCard.module.scss'
import type { ImageOverlayCardProps } from './ImageOverlayCard.types'

/**
 * Text card overlapping a photographic image -- card first in the DOM so
 * mobile (<1024px) stacks card-then-image with no extra markup; desktop
 * lays them out as flex siblings and pulls the card into the image with a
 * negative margin (see .module.scss) while the card's own z-index keeps it
 * in front.
 */
export default function ImageOverlayCard({
  image,
  imageAlt = '',
  imagePosition = 'left',
  cardBackgroundColor = 'var(--arb-color-cream)',
  accentColor = 'var(--arb-color-coral)',
  headline,
  text,
}: ImageOverlayCardProps) {
  return (
    <section
      className={styles.imageOverlayCard}
      data-image-position={imagePosition}
    >
      <div
        className={styles.imageOverlayCard__card}
        style={{ backgroundColor: cardBackgroundColor } as CSSProperties}
      >
        <span
          className={styles.imageOverlayCard__accent}
          style={{ backgroundColor: accentColor } as CSSProperties}
        />
        {headline && (
          <h2 className={styles.imageOverlayCard__headline}>{headline}</h2>
        )}
        {text && <p className={styles.imageOverlayCard__text}>{text}</p>}
      </div>
      {image && (
        <Image
          className={styles.imageOverlayCard__image}
          src={image}
          alt={imageAlt}
          width={600}
          height={585}
          sizes="(min-width: 64rem) 600px, 100vw"
        />
      )}
    </section>
  )
}
