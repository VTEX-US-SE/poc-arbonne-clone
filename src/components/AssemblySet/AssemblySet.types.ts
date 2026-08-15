export interface AssemblySetProps {
  /**
   * Overrides the copy above the picker. Defaults to the group's own name.
   * Supports `{max}`, `{min}` and `{selected}`.
   */
  headline?: string
  /**
   * Small print under the progress bar. Supports `{max}`, `{min}` and
   * `{selected}`, expanded per group from the catalog composition.
   */
  hint?: string
  /** Replaces `hint` once the group's min/max gate is satisfied. Same tokens. */
  completeHint?: string
  /**
   * Preferred Client discount, in percent, used for the PC Price row.
   * Measured at 20% on `arbonnepoc` (retail 49.00 / preferredclient 39.20).
   */
  pcDiscountPercent?: number
  ctaLabel?: string
}

export interface AssemblyOffer {
  price: number
  listPrice: number
  availability: string
}

export interface AssemblyProduct {
  sku: string
  name: string
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
  /**
   * Placeholder cards drawn in the group grid. The real count is catalog
   * data, so this is only a shape.
   *
   * @default 4
   */
  items?: number
}

/** Applies a new quantity to one SKU, clamped by its group's own gate. */
export type QuantityChangeHandler = (skuId: string, next: number) => void
