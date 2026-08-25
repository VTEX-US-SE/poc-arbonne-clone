import { useState } from 'react'
import { ImageGallery } from '@faststore/ui'
import {
  Image_unstable as Image,
  useBuyButton_unstable as useBuyButton,
  // @ts-ignore next-line
} from '@faststore/core/experimental'
import { usePDP } from 'src/sdk/overrides/PageProvider'
import { useSession } from 'src/sdk/session'
import { usePriceFormatter } from 'src/sdk/product/useFormattedPrice'
import { RichText } from 'src/components/ui/RichText'

import GalleryImage from './GalleryImage'
import { setBuilderHref } from '../../utils/assemblySet'
import { regionCodeFor } from '../../utils/locale'
import { replenishAttachment } from '../../utils/replenish'
import Price from '../Price/Price'
import styles from './ProductDetails.module.scss'
import type {
  ProductDetailsProps,
  PurchaseOption,
} from './ProductDetails.types'
import type { ReplenishFrequency } from '../../utils/replenish'
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
 * renders as HTML rather than being split into CMS fields. Picking ReplenishMe
 * attaches the subscription plan to the cart line -- see `utils/replenish`.
 */
export default function ProductDetails({
  sizePropertyName = 'Volume',
  customizeLabel = 'START CUSTOMIZING',
  priceLabel = 'YOUR PRICE',
  salePriceLabel = 'SALE PRICE',
  pcPriceLabel = 'PC PRICE',
  priceInfo = 'Your price reflects any active promotion. Preferred Clients pay the PC Price.',
  quantityLabel,
  addToCartLabel,
  replenishCtaLabel,
  instalmentsText,
  oneTimeLabel,
  replenishTitle,
  replenishText,
}: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1)
  const [purchaseOption, setPurchaseOption] =
    useState<PurchaseOption>('oneTime')
  const [frequency, setFrequency] = useState('')
  const [selectedImageIdx, setSelectedImageIdx] = useState(0)
  const [showStickyBar, setShowStickyBar] = useState(false)
  const { data } = usePDP()
  const { locale } = useSession()
  // The reference code's country comes from the active binding, so it follows a
  // locale switch instead of being pinned by an editor.
  const regionCode = regionCodeFor(locale)
  const product = data?.product
  const isValidating = Boolean(data?.isValidating)

  const offer = product?.offers?.offers?.[0]
  const outOfStock = offer?.availability === OUT_OF_STOCK
  const formatPrice = usePriceFormatter({ decimals: true })

  // Cast, same reason as `assemblyOptions` below: `pcPrice` and `salePrice`
  // reach the PDP through the `ClientProduct` / `ServerProduct` fragment
  // overrides, so they only appear in `@generated` after codegen has run.
  const productExtras = product as
    | { pcPrice?: number | null; salePrice?: number | null }
    | undefined

  const price = offer?.price ?? 0
  const listPrice = offer?.listPrice ?? 0
  const pcPrice = productExtras?.pcPrice

  // SALE PRICE is the retail promo price (`salePrice`), independent of the
  // shopper's tier. Shown only when a promo is actually running *and* it differs
  // from what they pay -- otherwise it just duplicates YOUR PRICE.
  const salePrice = productExtras?.salePrice ?? null
  // number when a genuine, differing retail promo exists; null hides the column.
  const shownSalePrice =
    salePrice !== null && salePrice !== price ? salePrice : null

  const selectedImage =
    product?.image?.[selectedImageIdx] ?? product?.image?.[0]

  const sizeLabel = product?.additionalProperty?.find(
    (property) => property.name === sizePropertyName
  )?.value

  // Cast rather than relying on generated types: `assemblyOptions` reaches the
  // PDP through our own `ClientProduct` fragment override, so it only appears
  // in `@generated` after codegen has run at least once.
  const assemblyOptions = (
    product as { assemblyOptions?: unknown[] } | undefined
  )?.assemblyOptions
  const isCustomisableSet = Boolean(assemblyOptions?.length)

  // Same cast, and for the same reason, as `assemblyOptions` above. Empty on a
  // product the ReplenishMe plan is not registered on -- including a set, whose
  // parent SKU carries the assembly attachment instead.
  const replenishFrequencies =
    (product as { replenishFrequencies?: ReplenishFrequency[] } | undefined)
      ?.replenishFrequencies ?? []

  const selectedFrequency = frequency || (replenishFrequencies[0]?.value ?? '')

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
            additionalProperty: [
              ...(product.additionalProperty ?? []),
              ...replenishAttachment(
                purchaseOption === 'replenish',
                selectedFrequency
              ),
            ],
            unitMultiplier: product.unitMultiplier,
          },
        }
      : null
  )

  if (!product) {
    return null
  }

  // Carries the quantity chosen here, so the builder's "Quantity of Customized
  // Sets" opens on the same number rather than resetting to 1.
  const builderHref = isCustomisableSet
    ? setBuilderHref(product.id, quantity)
    : undefined

  const description = product.description ? (
    <RichText
      className={styles.productDetails__description}
      content={product.description}
    />
  ) : null

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

      <div
        className={styles.productDetails__info}
        data-customisable-set={isCustomisableSet || undefined}
      >
        <h1 className={styles.productDetails__title}>{product.name}</h1>

        <p className={styles.productDetails__meta}>
          {sizeLabel && <span>{sizeLabel}</span>}
          {product.gtin && (
            <span>
              # {product.gtin} {regionCode}
            </span>
          )}
        </p>

        {/* A set's copy explains how many items to pick and what the discount
            is, so it has to be read before the CTA rather than after it. */}
        {isCustomisableSet && description}

        {/* No price grid or instalments on a set: the parent SKU is priced at
            zero, so a lone label stands in until the builder totals the
            selection. */}
        {isCustomisableSet ? (
          <p className={styles.productDetails__priceLabel}>{priceLabel}</p>
        ) : (
          <>
            {/* Prod's three columns. YOUR PRICE reuses `Price` (selling +
                struck SRP); SALE PRICE and PC PRICE are reference cells shown
                only when they exist. YOUR PRICE is the guest's sale price
                today -- once session tier is wired it swaps to `pcPrice` for a
                signed-in PC while these two columns stay put. */}
            <div className={styles.productDetails__priceGrid}>
              <div className={styles.productDetails__priceCol}>
                <p className={styles.productDetails__priceLabel}>
                  {priceLabel}
                  <span
                    className={styles.productDetails__priceInfo}
                    title={priceInfo}
                    aria-label={priceInfo}
                  >
                    &#9432;
                  </span>
                </p>
                <Price
                  price={price}
                  listPrice={listPrice}
                  pcPrice={null}
                  loading={isValidating}
                  variant="detail"
                />
              </div>

              {shownSalePrice !== null && (
                <div className={styles.productDetails__priceCol}>
                  <p className={styles.productDetails__priceLabel}>
                    {salePriceLabel}
                  </p>
                  <span className={styles.productDetails__priceSecondary}>
                    {formatPrice(shownSalePrice)}
                  </span>
                </div>
              )}

              {pcPrice != null && (
                <div className={styles.productDetails__priceCol}>
                  <p className={styles.productDetails__priceLabel}>
                    {pcPriceLabel}
                  </p>
                  <span className={styles.productDetails__priceSecondary}>
                    {formatPrice(pcPrice)}
                  </span>
                </div>
              )}
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
          </>
        )}

        <PurchaseOptions
          oneTimeLabel={oneTimeLabel}
          replenishTitle={replenishTitle}
          replenishText={replenishText}
          replenishFrequencies={replenishFrequencies}
          quantityLabel={quantityLabel}
          addToCartLabel={isCustomisableSet ? customizeLabel : addToCartLabel}
          replenishCtaLabel={replenishCtaLabel}
          buyProps={buyProps}
          disabled={outOfStock}
          loading={isValidating}
          quantity={quantity}
          onQuantityChange={setQuantity}
          onStickyChange={setShowStickyBar}
          ctaHref={builderHref}
          purchaseOption={purchaseOption}
          onPurchaseOptionChange={setPurchaseOption}
          frequency={selectedFrequency}
          onFrequencyChange={setFrequency}
        />

        {!isCustomisableSet && description}
      </div>

      {showStickyBar && (
        <StickyBar
          priceLabel={priceLabel}
          price={isCustomisableSet ? undefined : price}
          listPrice={listPrice}
          quantityLabel={quantityLabel}
          buttonLabel={isCustomisableSet ? customizeLabel : addToCartLabel}
          ctaHref={builderHref}
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
