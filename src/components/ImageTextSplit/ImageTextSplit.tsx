import Button from '../Button/Button'
import styles from './ImageTextSplit.module.scss'
import type { ImageTextSplitProps } from './ImageTextSplit.types'

export default function ImageTextSplit({
  image,
  imageAlt = '',
  imagePosition = 'left',
  textAlign = 'center',
  eyebrow,
  headline,
  text,
  cta,
}: ImageTextSplitProps) {
  return (
    <section
      className={styles.imageTextSplit}
      data-image-position={imagePosition}
    >
      {image && (
        <img className={styles.imageTextSplit__image} src={image} alt={imageAlt} />
      )}
      <div
        className={styles.imageTextSplit__content}
        data-text-align={textAlign}
      >
        {eyebrow && <p className={styles.imageTextSplit__eyebrow}>{eyebrow}</p>}
        {headline && (
          <h2 className={styles.imageTextSplit__headline}>{headline}</h2>
        )}
        {text && <p className={styles.imageTextSplit__text}>{text}</p>}
        {cta?.url && cta?.text && (
          <Button className={styles.imageTextSplit__cta} href={cta.url}>
            {cta.text}
          </Button>
        )}
      </div>
    </section>
  )
}
