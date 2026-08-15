import { gql } from '@generated'

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
                }
              }
            }
          }
        }
      }
    }
  }
`)
