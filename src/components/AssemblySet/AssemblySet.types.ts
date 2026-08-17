export interface AssemblySetProps {
  headline?: string
  hint?: string
  completeHint?: string
  pcDiscountPercent?: number
  ctaLabel?: string
}

export interface AssemblyOffer {
  price: number
  priceWithTaxes: number
  listPrice: number
  listPriceWithTaxes: number
  availability: string
  seller: { identifier: string }
}

/**
 * The full cart-item shape, not just what a card renders: the children are what
 * actually go into the cart, so `brand`, `isVariantOf` and `additionalProperty`
 * are needed by `useBuyButton`'s analytics payload and by the cart store's own
 * `getItemId`. All of them resolve through the `skuLoader` in
 * `graphql/vtex/resolvers` -- verified against SKU 1657's children.
 */
export interface AssemblyProduct {
  id: string
  sku: string
  name: string
  gtin: string
  unitMultiplier: number
  brand: { name: string }
  isVariantOf: {
    productGroupID: string
    name: string
    /** Rendered by core's `CartItem`, which reads `activeVariations` directly --
     *  absent here it throws, even though these SKUs have no variants. */
    skuVariants: {
      activeVariations: Record<string, string>
      slugsMap: Record<string, string>
      availableVariations: Record<string, unknown>
    }
  }
  /** `value` and `valueReference` are both loosely typed -- the API returns an
   *  object for `valueReference`, and neither is read here, only passed on. */
  additionalProperty: Array<{
    propertyID: string
    name: string
    value: unknown
    valueReference: unknown
  }>
  image: Array<{ url: string; alternateName: string }>
  offers: { offers: AssemblyOffer[] }
}

export interface AssemblyItem {
  skuId: string
  minQuantity: number
  maxQuantity: number
  initialQuantity: number
  product: AssemblyProduct | null
}

export interface AssemblyGroup {
  name: string
  minQuantity: number
  maxQuantity: number
  items: AssemblyItem[]
}

export interface AssemblyOption {
  id: string
  name: string
  required: boolean
  groups: AssemblyGroup[]
}

export interface AssemblySetSkeletonProps {
  items?: number
}

/** Applies a new quantity to one SKU, clamped by its group's own gate. */
export type QuantityChangeHandler = (skuId: string, next: number) => void
