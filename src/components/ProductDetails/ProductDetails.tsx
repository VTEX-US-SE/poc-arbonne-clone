import { useState } from 'react'
import { ImageGallery } from '@faststore/ui'
import {
  Image_unstable as Image,
  useBuyButton_unstable as useBuyButton,
  // @ts-ignore next-line
} from '@faststore/core/experimental'
import { usePDP } from 'src/sdk/overrides/PageProvider'
import { usePriceFormatter } from 'src/sdk/product/useFormattedPrice'
import { RichText } from 'src/components/ui/RichText'

import GalleryImage from './GalleryImage'
import Skeleton from '../Skeleton/Skeleton'
import styles from './ProductDetails.module.scss'
import type { ProductDetailsProps } from './ProductDetails.types'
import PurchaseOptions from './PurchaseOptions'
import StickyBar from './StickyBar'

const OUT_OF_STOCK = 'https://schema.org/OutOfStock'

/**
 * Fixed asset rather than a CMS field -- the instalments provider is not
 * something an editor picks per page.
 */
const KLARNA_BADGE_SRC =
  'https://arbonnepoc.vtexassets.com/assets/vtex.file-manager-graphql/images/1795fcbb-fe7f-459e-8b9c-36bd2093fcb8___4eb78c1e4fc29a1fe11f51046e2e8eb7.png'

/**
 * PDP buy block: gallery, title, pack size and reference code, price,
 * quantity and add-to-cart, then the product description.
 *
 * Everything real comes from the page's product -- the description already
 * contains the benefit bullets, "WHY IT'S DIFFERENT" and "GOOD FOR", so it
 * renders as HTML rather than being split into CMS fields. The purchase
 * options around it are mocked in code.
 */
export default function ProductDetails({
  refIdSuffix = 'US',
  sizePropertyName = 'Volume',
  priceLabel = 'YOUR PRICE',
  quantityLabel,
  addToCartLabel,
  replenishCtaLabel,
  instalmentsText,
  oneTimeLabel,
  replenishTitle,
  replenishText,
  replenishFrequencies,
}: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIdx, setSelectedImageIdx] = useState(0)
  const [showStickyBar, setShowStickyBar] = useState(false)
  const { data } = usePDP()
  const product = data?.product
  const isValidating = Boolean(data?.isValidating)

  const offer = product?.offers?.offers?.[0]
  const outOfStock = offer?.availability === OUT_OF_STOCK
  const formatPrice = usePriceFormatter({ decimals: true })
  const formattedPrice = formatPrice(offer?.price ?? 0)

  const selectedImage =
    product?.image?.[selectedImageIdx] ?? product?.image?.[0]

  const sizeLabel = product?.additionalProperty?.find(
    (property) => property.name === sizePropertyName
  )?.value

  const buyProps = useBuyButton(
    product && offer
      ? {
          id: product.id,
          price: offer.price,
          priceWithTaxes: offer.priceWithTaxes,
          listPrice: offer.listPrice,
          listPriceWithTaxes: offer.listPriceWithTaxes,
          seller: offer.seller,
          quantity,
          itemOffered: {
            sku: product.sku,
            name: product.name,
            gtin: product.gtin,
            image: [product.image?.[0]],
            brand: product.brand,
            isVariantOf: product.isVariantOf,
            additionalProperty: product.additionalProperty,
            unitMultiplier: product.unitMultiplier,
          },
        }
      : null
  )

  if (!product) {
    return null
  }

  return (
    <section className={styles.productDetails}>
      <div className={styles.productDetails__gallery}>
        <ImageGallery
          images={product.image}
          ImageComponent={GalleryImage}
          selectedImageIdx={selectedImageIdx}
          setSelectedImageIdx={setSelectedImageIdx}
          aria-label={product.name}
        >
          {selectedImage && (
            <span data-fs-image className={styles.productDetails__mainImage}>
              <GalleryImage
                url={selectedImage.url}
                alternateName={selectedImage.alternateName}
              />
            </span>
          )}
        </ImageGallery>
      </div>

      <div className={styles.productDetails__info}>
        <h1 className={styles.productDetails__title}>{product.name}</h1>

        <p className={styles.productDetails__meta}>
          {sizeLabel && <span>{sizeLabel}</span>}
          {product.gtin && (
            <span>
              # {product.gtin} {refIdSuffix}
            </span>
          )}
        </p>

        <p className={styles.productDetails__priceLabel}>{priceLabel}</p>
        <div className={styles.productDetails__price}>
          <Skeleton loading={isValidating} width="8rem" height="2.625rem">
            {formattedPrice}
          </Skeleton>
        </div>
        {instalmentsText && (
          <div className={styles.productDetails__instalments}>
            <Image
              className={styles.productDetails__klarna}
              src={KLARNA_BADGE_SRC}
              alt="Klarna"
              width={71}
              height={33}
            />
            <p className={styles.productDetails__instalmentsText}>
              {instalmentsText}
            </p>
          </div>
        )}

        <PurchaseOptions
          oneTimeLabel={oneTimeLabel}
          replenishTitle={replenishTitle}
          replenishText={replenishText}
          replenishFrequencies={replenishFrequencies}
          quantityLabel={quantityLabel}
          addToCartLabel={addToCartLabel}
          replenishCtaLabel={replenishCtaLabel}
          buyProps={buyProps}
          disabled={outOfStock}
          loading={isValidating}
          quantity={quantity}
          onQuantityChange={setQuantity}
          onStickyChange={setShowStickyBar}
        />

        {product.description && (
          <RichText
            className={styles.productDetails__description}
            content={product.description}
          />
        )}
      </div>

      {showStickyBar && (
        <StickyBar
          priceLabel={priceLabel}
          formattedPrice={formattedPrice}
          quantityLabel={quantityLabel}
          buttonLabel={addToCartLabel}
          buyProps={buyProps}
          disabled={outOfStock}
          loading={isValidating}
          quantity={quantity}
          onQuantityChange={setQuantity}
        />
      )}
    </section>
  )
}
