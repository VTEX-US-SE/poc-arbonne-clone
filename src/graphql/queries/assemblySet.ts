import { gql } from '@generated'

/**
 * Parent SKU of a customisable set, with the assembly option's groups and
 * every eligible child product. Resolved by `graphql/vtex/resolvers`, which
 * derives `assemblyOptions` from the SKU's raw attachments.
 */
export const query = gql(`
  query ArbAssemblySetQuery($locator: [IStoreSelectedFacet!]!) {
    product(locator: $locator) {
      sku
      slug
      name
      image {
        url
        alternateName
      }
      offers {
        offers {
          price
        }
      }
      assemblyOptions {
        id
        name
        required
        groups {
          name
          minQuantity
          maxQuantity
          items {
            skuId
            minQuantity
            maxQuantity
            initialQuantity
            product {
              sku
              name
              image {
                url
                alternateName
              }
              offers {
                offers {
                  price
                  listPrice
                  availability
                  seller {
                    identifier
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`)
