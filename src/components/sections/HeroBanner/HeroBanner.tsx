import styles from './HeroBanner.module.scss'

export interface HeroBannerProps {
  desktopImage?: string
  mobileImage?: string
  imageAlt?: string
  backgroundColor?: string
  eyebrow?: string
  headline?: string
  subheadline?: string
  text?: string
  cta?: {
    url: string
    text: string
  }
}

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
    <section className={styles.section} style={{ backgroundColor }}>
      {mobileImage && (
        <img className={styles.imageMobile} src={mobileImage} alt={imageAlt} />
      )}
      {desktopImage && (
        <img className={styles.imageDesktop} src={desktopImage} alt={imageAlt} />
      )}
      <div className={styles.content}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        {headline && <h1 className={styles.headline}>{headline}</h1>}
        {subheadline && <h3 className={styles.subheadline}>{subheadline}</h3>}
        {text && <p className={styles.text}>{text}</p>}
        {cta?.url && cta?.text && (
          <a className={styles.cta} href={cta.url}>
            {cta.text}
          </a>
        )}
      </div>
    </section>
  )
}
