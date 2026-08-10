import type { CSSProperties } from 'react'

import Button from '../Button/Button'
import styles from './HeroBanner.module.scss'
import type { HeroBannerProps } from './HeroBanner.types'

/**
 * Full-width promo banner: art-directed mobile/desktop background image,
 * an eyebrow/headline/subheadline/text stack, and an optional CTA. Content
 * position (`left`/`center`/`right`) and CTA color scheme are configurable
 * per instance so this one component covers every full-bleed hero variant
 * on the homepage.
 */
export default function HeroBanner({
  desktopImage,
  mobileImage,
  imageAlt = '',
  backgroundColor = '#efefef',
  textColor = '#252525',
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
        <img
          className={styles.heroBanner__imageMobile}
          src={mobileImage}
          alt={imageAlt}
        />
      )}
      {desktopImage && (
        <img
          className={styles.heroBanner__imageDesktop}
          src={desktopImage}
          alt={imageAlt}
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
