import { LinkButton } from '@faststore/ui'

import styles from './HeroBanner.module.scss'
import type { HeroBannerProps } from './HeroBanner.types'

export default function HeroBanner({
  desktopImage,
  mobileImage,
  imageAlt = '',
  backgroundColor = '#efefef',
  eyebrow,
  headline,
  subheadline,
  text,
  cta,
}: HeroBannerProps) {
  return (
    <section className={styles.heroBanner} style={{ backgroundColor }}>
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
      <div className={styles.heroBanner__content}>
        {eyebrow && <p className={styles.heroBanner__eyebrow}>{eyebrow}</p>}
        {headline && <h1 className={styles.heroBanner__headline}>{headline}</h1>}
        {subheadline && (
          <h3 className={styles.heroBanner__subheadline}>{subheadline}</h3>
        )}
        {text && <p className={styles.heroBanner__text}>{text}</p>}
        {cta?.url && cta?.text && (
          <LinkButton className={styles.heroBanner__cta} href={cta.url}>
            {cta.text}
          </LinkButton>
        )}
      </div>
    </section>
  )
}
