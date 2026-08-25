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
  index?: number
  /**
   * Drops the hover lift and leaves the cart open. For contexts that clip their
   * overflow, where a card growing past its own box is cut off, not revealed.
   */
  staticCard?: boolean
  [prop: string]: unknown
}
