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
              id: productID
              sku
              name
              gtin
              unitMultiplier
              brand {
                name
              }
              isVariantOf {
                productGroupID
                name
                skuVariants {
                  activeVariations
                  slugsMap
                  availableVariations
                }
              }
              additionalProperty {
                propertyID
                name
                value
                valueReference
              }
              image {
                url
                alternateName
              }
              offers {
                offers {
                  price
                  priceWithTaxes
                  listPrice
                  listPriceWithTaxes
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
