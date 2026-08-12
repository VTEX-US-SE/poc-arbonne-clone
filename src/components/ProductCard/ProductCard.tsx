import { useState } from 'react'
import { BuyButton, QuantitySelector } from '@faststore/ui'
import {
  Image_unstable as Image,
  useBuyButton_unstable as useBuyButton,
  useProductLink_unstable as useProductLink,
  // @ts-ignore next-line
} from '@faststore/core/experimental'
import { usePriceFormatter } from 'src/sdk/product/useFormattedPrice'

import styles from './ProductCard.module.scss'
import type { ProductCardProps } from './ProductCard.types'

const OUT_OF_STOCK = 'https://schema.org/OutOfStock'

/**
 * Brand product card: image, name, reference code, price, quantity selector
 * and add-to-cart. Takes an already-fetched product, so grids that queried a
 * list render without a second request per card.
 */
export default function ProductCard({
  product,
  index = 0,
  refIdSuffix = 'US',
  ...rest
}: ProductCardProps) {
  const [quantity, setQuantity] = useState(1)

  const dataProps = Object.fromEntries(
    Object.entries(rest).filter(([prop]) => prop.startsWith('data-'))
  )

  const {
    id,
    sku,
    name,
    gtin,
    brand,
    isVariantOf,
    unitMultiplier,
    additionalProperty,
    image: [image],
    offers: {
      offers: [
        {
          price,
          priceWithTaxes,
          listPrice,
          listPriceWithTaxes,
          availability,
          seller,
        },
      ],
    },
  } = product

  const formatPrice = usePriceFormatter({ decimals: true })
  const formattedPrice = formatPrice(price)
  const outOfStock = availability === OUT_OF_STOCK
  const linkProps = useProductLink({
    index,
    product,
    selectedOffer: 0,
  })

  const buyProps = useBuyButton({
    id,
    price,
    priceWithTaxes,
    listPrice,
    listPriceWithTaxes,
    seller,
    quantity,
    itemOffered: {
      sku,
      name,
      gtin,
      image: [image],
      brand,
      isVariantOf,
      additionalProperty,
      unitMultiplier,
    },
  })

  return (
    <article className={styles.productCard} {...dataProps}>
      <a className={styles.productCard__link} {...linkProps}>
        <span className={styles.productCard__media}>
          {image && (
            <Image
              src={image.url}
              alt={image.alternateName ?? name}
              width={277}
              height={277}
              sizes="(min-width: 64rem) 277px, (min-width: 40rem) 50vw, 100vw"
            />
          )}
        </span>
        <span className={styles.productCard__name}>{name}</span>
      </a>

      {gtin && (
        <p className={styles.productCard__refId}>
          # {gtin} {refIdSuffix}
        </p>
      )}

      <p className={styles.productCard__price}>{formattedPrice}</p>

      <div className={styles.productCard__cart}>
        <span className={styles.productCard__quantityLabel}>Quantity</span>
        <div className={styles.productCard__cartRow}>
          <QuantitySelector
            min={1}
            initial={1}
            disabled={outOfStock}
            onChange={setQuantity}
          />
          <BuyButton
            {...buyProps}
            variant="primary"
            className={styles.productCard__buy}
            disabled={outOfStock}
          >
            Add to Cart
          </BuyButton>
        </div>
      </div>
    </article>
  )
}
