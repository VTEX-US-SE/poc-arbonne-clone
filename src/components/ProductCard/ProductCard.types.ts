// @ts-ignore next-line
import type { ProductSummary_ProductFragment } from '@generated/graphql'

/**
 * Exactly what core's product queries return per product -- the same
 * fragment `useProductsQuery` puts on `edges[].node`. Aliased rather than
 * hand-written so it cannot drift from the schema on a core upgrade.
 */
export type ProductCardProduct = ProductSummary_ProductFragment

export interface ProductCardProps {
  product: ProductCardProduct
  /**
   * Position in its grid or carousel, reported in the product-click
   * analytics event.
   */
  index?: number
  /**
   * Locale suffix printed after the reference code, as in `# 4315 US`.
   */
  refIdSuffix?: string
  /**
   * Core's gallery grid passes its own card props plus the `data-af-*`
   * attributes Intelligent Search reads for click attribution. Only the
   * latter are forwarded; the rest are accepted and ignored.
   */
  [prop: string]: unknown
}
