import { Link } from '@faststore/ui'
import {
  Image_unstable as Image,
  // @ts-ignore next-line
} from '@faststore/core/experimental'

import Button from '../Button/Button'
import styles from './ImageTextSplit.module.scss'
import type { ImageTextSplitProps } from './ImageTextSplit.types'

/**
 * Two-column layout: an image on one side, a text block (eyebrow/headline/
 * text/link/CTA) on the other. `imagePosition` mirrors the layout left/right,
 * `textAlign` controls the text block's own alignment.
 */
export default function ImageTextSplit({
  image,
  imageAlt = '',
  imagePosition = 'left',
  textAlign = 'center',
  eyebrow,
  headline,
  text,
  link,
  cta,
}: ImageTextSplitProps) {
  return (
    <section
      className={styles.imageTextSplit}
      data-image-position={imagePosition}
    >
      {image && (
        <Image
          className={styles.imageTextSplit__image}
          src={image}
          alt={imageAlt}
          width={960}
          height={960}
          sizes="(min-width: 64rem) 50vw, 100vw"
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
        {text && <p className={styles.imageTextSplit__text}>{text}</p>}
        {link?.url && link?.text && (
          <p className={styles.imageTextSplit__link}>
            <Link href={link.url}>{link.text}</Link>
          </p>
        )}
        {cta?.url && cta?.text && (
          <Button
            className={styles.imageTextSplit__cta}
            href={cta.url}
            colorScheme={cta.colorScheme ?? 'whiteOutline'}
          >
            {cta.text}
          </Button>
        )}
      </div>
    </section>
  )
}
