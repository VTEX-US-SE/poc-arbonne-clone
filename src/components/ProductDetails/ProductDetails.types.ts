export type PurchaseOption = 'oneTime' | 'replenish'

/**
 * One delivery cadence. `value` is the raw domain string VTEX validates the
 * cart attachment against, spacing included -- never trim it before sending.
 */
export interface ProductDetailsFrequency {
  value: string
  label: string
}

export interface ProductDetailsProps {
  sizePropertyName?: string
  /**
   * Label for the customise CTA. Separate from `addToCartLabel` because the PDP
   * is one content type: a single label cannot read correctly on both a normal
   * product and a set.
   */
  customizeLabel?: string
  priceLabel?: string
  quantityLabel?: string
  addToCartLabel?: string
  replenishCtaLabel?: string
  instalmentsText?: string
  oneTimeLabel?: string
  replenishTitle?: string
  replenishText?: string
}

export interface GalleryImageProps {
  url: string
  alternateName?: string
}

/** What every purchase surface needs to hand to `PurchaseCta`. */
interface PurchaseSurfaceProps {
  buyProps: Record<string, unknown>
  disabled?: boolean
  loading?: boolean
  quantity: number
  onQuantityChange: (value: number) => void
  /**
   * Turns the CTA into a link to this href instead of an add-to-cart. Set for
   * customisable sets, whose parent SKU is priced at zero -- the shopper has to
   * compose the set before anything can go in the cart.
   */
  ctaHref?: string
}

export interface PurchaseOptionsProps
  extends
    PurchaseSurfaceProps,
    Pick<
      ProductDetailsProps,
      | 'oneTimeLabel'
      | 'replenishTitle'
      | 'replenishText'
      | 'quantityLabel'
      | 'addToCartLabel'
      | 'replenishCtaLabel'
    > {
  onStickyChange: (stuck: boolean) => void
  /**
   * Cadences the SKU's subscription plan offers, from the catalog attachment.
   * Empty hides the ReplenishMe option entirely -- the plan is not registered
   * on this product, so an attachment would be rejected at checkout.
   */
  replenishFrequencies: ProductDetailsFrequency[]
  purchaseOption: PurchaseOption
  onPurchaseOptionChange: (option: PurchaseOption) => void
  /** Already resolved to the first frequency when nothing has been picked. */
  frequency: string
  onFrequencyChange: (value: string) => void
}

export interface StickyBarProps
  extends
    PurchaseSurfaceProps,
    Pick<ProductDetailsProps, 'priceLabel' | 'quantityLabel'> {
  /** Omitted for a customisable set, which has no price to show yet. */
  formattedPrice?: string
  buttonLabel?: string
}
