import { Link } from '@faststore/ui'

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
  inlineLink,
  cta,
}: ImageTextSplitProps) {
  return (
    <section
      className={styles.imageTextSplit}
      data-image-position={imagePosition}
    >
      {image && (
        <img
          className={styles.imageTextSplit__image}
          src={image}
          alt={imageAlt}
        />
      )}
      <div
        className={styles.imageTextSplit__content}
        data-text-align={textAlign}
      >
        {eyebrow && <p className={styles.imageTextSplit__eyebrow}>{eyebrow}</p>}
        {headline && (
          <h2 className={styles.imageTextSplit__headline}>{headline}</h2>
        )}
        {text && (
          <p className={styles.imageTextSplit__text}>
            {text}
            {inlineLink?.url && inlineLink?.text && (
              <>
                {' '}
                <Link
                  className={styles.imageTextSplit__inlineLink}
                  href={inlineLink.url}
                >
                  {inlineLink.text}
                </Link>
                .
              </>
            )}
          </p>
        )}
        {cta?.url && cta?.text && (
          <Button
            className={styles.imageTextSplit__cta}
            href={cta.url}
            letterSpacing="0.125rem"
            colorScheme={cta.colorScheme}
          >
            {cta.text}
          </Button>
        )}
      </div>
    </section>
  )
}
