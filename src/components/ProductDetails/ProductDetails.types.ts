export type PurchaseOption = 'oneTime' | 'replenish'

export interface ProductDetailsFrequency {
  value: string
  label: string
}

export interface ProductDetailsProps {
  refIdSuffix?: string
  sizePropertyName?: string
  priceLabel?: string
  quantityLabel?: string
  addToCartLabel?: string
  replenishCtaLabel?: string
  instalmentsText?: string
  oneTimeLabel?: string
  replenishTitle?: string
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
  loading?: boolean
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
  onStickyChange: (stuck: boolean) => void
}

export interface StickyBarProps
  extends
    PurchaseSurfaceProps,
    Pick<ProductDetailsProps, 'priceLabel' | 'quantityLabel'> {
  formattedPrice: string
  buttonLabel?: string
}
