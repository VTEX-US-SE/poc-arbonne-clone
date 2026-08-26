import { gql } from '@generated'

/**
 * Overrides core's stub to add `assemblyOptions` to the PDP's *server* query.
 *
 * `usePDP` merges server and client data, so without this a customisable set
 * renders as a normal PDP -- price, instalments and Add to Cart -- until the
 * client query resolves. The set layout has to be right at first paint, not
 * after a flash of the wrong one.
 *
 * Only `id` is requested, same as `ClientProduct`: the resolver parses the SKU's
 * already-loaded `attachments` in memory, and the expensive child hydration only
 * happens if `items { product }` is asked for.
 */
export const fragment = gql(`
  fragment ServerProduct on Query {
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
