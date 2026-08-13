import {
  Image_unstable as Image,
  useProductLink_unstable as useProductLink,
  // @ts-ignore next-line
} from '@faststore/core/experimental'
import { usePriceFormatter } from 'src/sdk/product/useFormattedPrice'

import styles from './SearchBox.module.scss'
import type { SearchProductRowProps } from './SearchBox.types'

/**
 * One product in the search dropdown. Separate from SearchBox because
 * `useProductLink` is a hook and so cannot be called inside a `.map`.
 */
export default function SearchProductRow({
  product,
  index,
  onNavigate,
}: SearchProductRowProps) {
  const formatPrice = usePriceFormatter({ decimals: true })
  const linkProps = useProductLink({ index, product, selectedOffer: 0 })

  const {
    name,
    image: [image],
    offers: {
      offers: [{ price }],
    },
  } = product

  return (
    <a
      className={styles.searchBox__product}
      {...linkProps}
      onClick={() => {
        linkProps.onClick?.()
        onNavigate()
      }}
    >
      {image && (
        <Image
          className={styles.searchBox__productImage}
          src={image.url}
          alt={image.alternateName ?? name}
          width={48}
          height={48}
          sizes="48px"
        />
      )}
      <span className={styles.searchBox__productInfo}>
        <span className={styles.searchBox__productName}>{name}</span>
        <span className={styles.searchBox__productPrice}>
          {formatPrice(price)}
        </span>
      </span>
    </a>
  )
}
