export interface AssemblySetProps {
  headline?: string
  hint?: string
  completeHint?: string
  pcDiscountPercent?: number
  ctaLabel?: string
}

export interface AssemblyOffer {
  price: number
  listPrice: number
  availability: string
  seller: { identifier: string }
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
  items?: number
}

/** Applies a new quantity to one SKU, clamped by its group's own gate. */
export type QuantityChangeHandler = (skuId: string, next: number) => void

/** One chosen child SKU, in the shape Checkout's composition endpoint wants. */
export interface SetSelection {
  skuId: string
  quantity: number
  seller: string
}
