import { gql } from '@generated'

/**
 * Overrides core's stub to add `assemblyOptions` to every product node, so
 * `ProductCard` can tell a customisable set apart from a normal product.
 *
 * Core selects the nodes through `ProductSummary_product`; GraphQL merges
 * selections on the same field path, so this adds to that node rather than
 * replacing it. Only `id` is requested -- the resolver reads the SKU's
 * already-loaded attachments in memory, and the expensive child hydration only
 * runs if `items { product }` is asked for.
 */
export const fragment = gql(`
  fragment ClientProductGallery on Query {
    search(
      first: $first
      after: $after
      sort: $sort
      term: $term
      selectedFacets: $selectedFacets
    ) {
      products {
        pageInfo {
          totalCount
        }
        edges {
          node {
            assemblyOptions {
              id
            }
          }
        }
      }
    }
  }
`)
