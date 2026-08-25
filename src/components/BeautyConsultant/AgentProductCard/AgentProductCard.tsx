import { useEffect, useState } from 'react'
import { usePriceFormatter } from 'src/sdk/product/useFormattedPrice'

import { safeProductHref } from '../../../utils/agentChat'
import styles from './AgentProductCard.module.scss'
import type { AgentProductCardProps } from './AgentProductCard.types'

export default function AgentProductCard({ product }: AgentProductCardProps) {
  const formatPrice = usePriceFormatter({ decimals: true })
  const [href, setHref] = useState<string | null>(null)

  useEffect(() => {
    setHref(safeProductHref(product.url, window.location.origin))
  }, [product.url])

  const content = (
    <>
      {product.image && (
        <img
          className={styles.agentProductCard__image}
          src={product.image}
          alt=""
          width={112}
          height={112}
          loading="lazy"
        />
      )}
      <span className={styles.agentProductCard__content}>
        <span className={styles.agentProductCard__name}>{product.name}</span>
        {product.price !== undefined && (
          <span className={styles.agentProductCard__price}>
            {formatPrice(product.price)}
          </span>
        )}
        <span className={styles.agentProductCard__action}>
          {href ? 'View product' : 'Product details unavailable'}
        </span>
      </span>
    </>
  )

  return href ? (
    <a className={styles.agentProductCard} href={href}>
      {content}
    </a>
  ) : (
    <article className={styles.agentProductCard} data-disabled>
      {content}
    </article>
  )
}
