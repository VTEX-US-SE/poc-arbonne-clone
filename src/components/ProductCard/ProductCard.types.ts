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
  [prop: string]: unknown
}
