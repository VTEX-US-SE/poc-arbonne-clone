import { gql } from '@generated'

/**
 * Overrides core's stub to add `assemblyOptions` to the PDP's client query, so
 * `ProductDetails` can tell a customisable set apart from a normal product and
 * render the set layout instead of the buy box.
 *
 * Only `id` is requested. The resolver parses the SKU's already-loaded
 * `attachments` in memory, and the expensive part -- hydrating each child SKU
 * through `skuLoader` -- only runs if `items { product }` is asked for. Leaving
 * that out keeps this free on every other PDP.
 */
export const fragment = gql(`
  fragment ClientProduct on Query {
    product(locator: $locator) {
      id: productID
      assemblyOptions {
        id
      }
      pcPrice
      salePrice
      replenishFrequencies {
        value
        label
      }
    }
  }
`)
