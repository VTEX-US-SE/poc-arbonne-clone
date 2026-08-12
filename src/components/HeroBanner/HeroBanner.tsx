import type { CSSProperties } from 'react'
import {
  Image_unstable as Image,
  // @ts-ignore next-line
} from '@faststore/core/experimental'

import Button from '../Button/Button'
import styles from './HeroBanner.module.scss'
import type { HeroBannerProps } from './HeroBanner.types'

/**
 * Full-width promo banner: art-directed mobile/desktop image, an eyebrow/
 * headline/subheadline/text stack, and an optional CTA. Content position
 * (`left`/`center`/`right`) and CTA color scheme are configurable per
 * instance so this one component covers every hero variant on the
 * homepage. Below 1024px the image and content stack as two normal
 * blocks (content gets its own solid backgroundColor fill below the
 * image); at 1024px and up content overlays the image, positioned within
 * a centered 1200px zone per `contentPosition`. Mobile image aspect-ratio
 * (1:1) is an unverified placeholder -- no mobile capture exists to
 * confirm it.
 */
export default function HeroBanner({
  desktopImage,
  mobileImage,
  imageAlt = '',
  backgroundColor = 'var(--arb-color-gray-light)',
  textColor = 'var(--arb-color-text)',
  contentPosition = 'center',
  eyebrow,
  headline,
  subheadline,
  text,
  cta,
}: HeroBannerProps) {
  return (
    <section
      className={styles.heroBanner}
      style={
        {
          backgroundColor,
          '--fs-color-text': textColor,
          '--fs-color-text-display': textColor,
        } as CSSProperties
      }
    >
      {mobileImage && (
        <Image
          className={styles.heroBanner__imageMobile}
          src={mobileImage}
          alt={imageAlt}
          width={768}
          height={768}
          sizes="100vw"
        />
      )}
      {desktopImage && (
        <Image
          className={styles.heroBanner__imageDesktop}
          src={desktopImage}
          alt={imageAlt}
          width={1920}
          height={1920}
          sizes="100vw"
        />
      )}
      <div
        className={styles.heroBanner__contentWrapper}
        data-content-position={contentPosition}
      >
        <div className={styles.heroBanner__content}>
          {eyebrow && <p className={styles.heroBanner__eyebrow}>{eyebrow}</p>}
          {headline && (
            <h1 className={styles.heroBanner__headline}>{headline}</h1>
          )}
          {subheadline && (
            <h3 className={styles.heroBanner__subheadline}>{subheadline}</h3>
          )}
          {text && <p className={styles.heroBanner__text}>{text}</p>}
          {cta?.url && cta?.text && (
            <Button
              className={styles.heroBanner__cta}
              href={cta.url}
              colorScheme={cta.colorScheme}
            >
              {cta.text}
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
