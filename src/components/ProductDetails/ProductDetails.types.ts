export type PurchaseOption = 'oneTime' | 'replenish'

export interface ProductDetailsFrequency {
  value: string
  label: string
}

export interface ProductDetailsProps {
  /**
   * Locale suffix printed after the reference code, as in `# 4315 US`.
   */
  refIdSuffix?: string
  /**
   * Name of the product specification holding the pack size, printed
   * before the reference code.
   */
  sizePropertyName?: string
  priceLabel?: string
  /**
   * Shared with the sticky bar and both purchase options. `PurchaseCta`
   * holds the fallbacks, so these only override.
   */
  quantityLabel?: string
  addToCartLabel?: string
  replenishCtaLabel?: string
  instalmentsText?: string
  /**
   * Purchase options are a visual mock -- subscriptions are not wired up --
   * but the copy lives in the CMS so it can be translated per locale.
   * Button and quantity labels default in `PurchaseCta` instead, so they are
   * written once for every purchase surface.
   */
  oneTimeLabel?: string
  replenishTitle?: string
  /**
   * Rich text: carries its own list markup and the bonus paragraph.
   */
  replenishText?: string
  replenishFrequencies?: ProductDetailsFrequency[]
}

export interface GalleryImageProps {
  url: string
  alternateName?: string
}

/** What every purchase surface needs to hand to `PurchaseCta`. */
interface PurchaseSurfaceProps {
  buyProps: Record<string, unknown>
  disabled?: boolean
  /** True while the PDP revalidates the offer against the client session. */
  loading?: boolean
  /** Live quantity, so every surface's selector shows the same number. */
  quantity: number
  onQuantityChange: (value: number) => void
}

export interface PurchaseOptionsProps
  extends
    PurchaseSurfaceProps,
    Pick<
      ProductDetailsProps,
      | 'oneTimeLabel'
      | 'replenishTitle'
      | 'replenishText'
      | 'replenishFrequencies'
      | 'quantityLabel'
      | 'addToCartLabel'
      | 'replenishCtaLabel'
    > {
  /**
   * Fires when the option group crosses the top of the viewport. Must be
   * referentially stable -- it is an observer dependency.
   */
  onStickyChange: (stuck: boolean) => void
}

export interface StickyBarProps
  extends
    PurchaseSurfaceProps,
    Pick<ProductDetailsProps, 'priceLabel' | 'quantityLabel'> {
  formattedPrice: string
  buttonLabel?: string
}
