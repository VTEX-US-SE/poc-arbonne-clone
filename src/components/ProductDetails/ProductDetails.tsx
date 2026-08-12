import { useEffect, useRef, useState } from 'react'
import { ImageGallery } from '@faststore/ui'
import {
  Image_unstable as Image,
  useBuyButton_unstable as useBuyButton,
  // @ts-ignore next-line
} from '@faststore/core/experimental'
import { usePDP } from 'src/sdk/overrides/PageProvider'
import { usePriceFormatter } from 'src/sdk/product/useFormattedPrice'
import { RichText } from 'src/components/ui/RichText'

import styles from './ProductDetails.module.scss'
import PurchaseCta from '../PurchaseCta/PurchaseCta'
import type {
  ProductDetailsProps,
  PurchaseOption,
} from './ProductDetails.types'

const OUT_OF_STOCK = 'https://schema.org/OutOfStock'

/**
 * Fixed asset rather than a CMS field -- the instalments provider is not
 * something an editor picks per page.
 */
const KLARNA_BADGE_SRC =
  'https://arbonnepoc.vtexassets.com/assets/vtex.file-manager-graphql/images/1795fcbb-fe7f-459e-8b9c-36bd2093fcb8___4eb78c1e4fc29a1fe11f51046e2e8eb7.png'

/**
 * Feeds both the 496px viewer and the 72px thumbnails, so it is sized for
 * the larger of the two and reuses the same optimised URLs for both.
 */
function GalleryImage({
  url,
  alternateName,
}: {
  url: string
  alternateName?: string
}) {
  return (
    <Image
      src={url}
      alt={alternateName ?? ''}
      width={496}
      height={496}
      sizes="(min-width: 80rem) 496px, 100vw"
    />
  )
}

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
  replenishCtaLabel = 'Add to ReplenishMe',
  instalmentsText,
  oneTimeLabel = 'One-time purchase',
  replenishTitle,
  replenishText,
  replenishFrequencies = [],
}: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIdx, setSelectedImageIdx] = useState(0)
  const [purchaseOption, setPurchaseOption] =
    useState<PurchaseOption>('oneTime')
  const [frequency, setFrequency] = useState('')
  const [showStickyBar, setShowStickyBar] = useState(false)
  const optionsRef = useRef<HTMLDivElement>(null)
  const { data } = usePDP()
  const product = data?.product

  useEffect(() => {
    const target = optionsRef.current

    if (!target) return

    const observer = new IntersectionObserver(
      ([entry]) =>
        setShowStickyBar(
          !entry.isIntersecting && entry.boundingClientRect.top < 0
        ),
      { threshold: 0 }
    )

    observer.observe(target)

    return () => observer.disconnect()
  }, [product])

  const offer = product?.offers?.offers?.[0]
  const outOfStock = offer?.availability === OUT_OF_STOCK
  const frequencyOptions = Object.fromEntries(
    replenishFrequencies.map(({ value, label }) => [value, label])
  )
  const selectedFrequency = frequency || (replenishFrequencies[0]?.value ?? '')
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
        <p className={styles.productDetails__price}>{formattedPrice}</p>
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

        <div
          ref={optionsRef}
          className={styles.productDetails__options}
          role="radiogroup"
          aria-label="Purchase options"
        >
          <div
            className={styles.productDetails__option}
            data-selected={purchaseOption === 'oneTime'}
          >
            <button
              type="button"
              role="radio"
              aria-checked={purchaseOption === 'oneTime'}
              className={styles.productDetails__optionLabel}
              onClick={() => setPurchaseOption('oneTime')}
            >
              {oneTimeLabel}
            </button>

            {purchaseOption === 'oneTime' && (
              <PurchaseCta
                className={styles.productDetails__cta}
                quantityLabel={quantityLabel}
                buttonLabel={addToCartLabel}
                buyProps={buyProps}
                disabled={outOfStock}
                onQuantityChange={setQuantity}
              />
            )}
          </div>

          <div
            className={styles.productDetails__option}
            data-selected={purchaseOption === 'replenish'}
          >
            <button
              type="button"
              role="radio"
              aria-checked={purchaseOption === 'replenish'}
              className={styles.productDetails__optionLabel}
              onClick={() => setPurchaseOption('replenish')}
            >
              {replenishTitle}
            </button>

            {replenishText && (
              <RichText
                className={styles.productDetails__replenishText}
                content={replenishText}
              />
            )}

            {purchaseOption === 'replenish' && (
              <PurchaseCta
                className={styles.productDetails__cta}
                quantityLabel={quantityLabel}
                buttonLabel={replenishCtaLabel}
                buyProps={buyProps}
                disabled={outOfStock}
                onQuantityChange={setQuantity}
                frequencies={frequencyOptions}
                frequency={selectedFrequency}
                onFrequencyChange={setFrequency}
              />
            )}
          </div>
        </div>

        {product.description && (
          <RichText
            className={styles.productDetails__description}
            content={product.description}
          />
        )}
      </div>

      {showStickyBar && (
        <div className={styles.productDetails__stickyBar}>
          <div className={styles.productDetails__stickyBarInner}>
            <div className={styles.productDetails__stickyBarPrice}>
              <span className={styles.productDetails__priceLabel}>
                {priceLabel}
              </span>
              <span className={styles.productDetails__price}>
                {formattedPrice}
              </span>
            </div>

            <PurchaseCta
              quantityLabel={quantityLabel}
              buttonLabel={addToCartLabel}
              buyProps={buyProps}
              disabled={outOfStock}
              onQuantityChange={setQuantity}
            />
          </div>
        </div>
      )}
    </section>
  )
}
