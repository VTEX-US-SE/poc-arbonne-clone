import type { CSSProperties } from 'react'
import { getImageProps } from 'next/image'
import { faststoreLoader } from 'src/components/ui/Image/loader'

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
  priority = false,
  backgroundColor = 'var(--arb-color-gray-light)',
  textColor = 'var(--arb-color-text)',
  contentPosition = 'center',
  eyebrow,
  headline,
  subheadline,
  text,
  cta,
}: HeroBannerProps) {
  const shared = {
    alt: imageAlt,
    sizes: '100vw',
    loader: faststoreLoader,
    priority,
  }

  const mobile = mobileImage
    ? getImageProps({ ...shared, src: mobileImage, width: 768, height: 768 })
        .props
    : undefined

  const desktop = desktopImage
    ? getImageProps({ ...shared, src: desktopImage, width: 1920, height: 1920 })
        .props
    : undefined

  const fallback = mobile ?? desktop

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
      {fallback && (
        <picture>
          {mobile && desktop && (
            <source
              media="(min-width: 64rem)"
              srcSet={desktop.srcSet}
              sizes={desktop.sizes}
            />
          )}
          <img {...fallback} className={styles.heroBanner__image} />
        </picture>
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
            <h2 className={styles.heroBanner__subheadline}>{subheadline}</h2>
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
