import {
  Image_unstable as Image,
  // @ts-ignore next-line
} from '@faststore/core/experimental'

import styles from './CategoryHero.module.scss'
import type { CategoryHeroProps } from './CategoryHero.types'

/**
 * Category banner: a wide image with a cream card overlapping its lower edge,
 * holding a short rule, a display headline and a line of copy. Both crops are
 * roughly 3.5:1 (desktop 1440x405 capped and centred, mobile 375x106 full
 * width). The card is pulled up over the image only when an image for that
 * breakpoint is present, and its overhang below the image is part of the
 * section's height, so the next section is pushed down rather than covered.
 */
export default function CategoryHero({
  desktopImage,
  mobileImage,
  imageAlt = '',
  headline,
  text,
}: CategoryHeroProps) {
  return (
    <section className={styles.categoryHero}>
      {mobileImage && (
        <Image
          className={styles.categoryHero__imageMobile}
          src={mobileImage}
          alt={imageAlt}
          width={375}
          height={106}
          sizes="100vw"
        />
      )}
      {desktopImage && (
        <Image
          className={styles.categoryHero__imageDesktop}
          src={desktopImage}
          alt={imageAlt}
          width={1440}
          height={405}
          sizes="(min-width: 90rem) 1440px, 100vw"
        />
      )}
      <div className={styles.categoryHero__cardWrapper}>
        <div className={styles.categoryHero__card}>
          <span className={styles.categoryHero__rule} />
          {headline && (
            <h1 className={styles.categoryHero__headline}>{headline}</h1>
          )}
          {text && <p className={styles.categoryHero__text}>{text}</p>}
        </div>
      </div>
    </section>
  )
}
