import { gql } from '@generated'

/**
 * One SKU with just the fields a cart item needs, for adding a product the page
 * never queried -- the login modal is not a PDP, so `usePDP()` has nothing to
 * offer it.
 *
 * `productID` is the SKU id in FastStore's model; `isVariantOf.productGroupID`
 * is the product it belongs to. The cart wants the former.
 *
 * The selection mirrors core's own `CartProductItem` fragment -- the drawer's
 * `CartItem` reads `isVariantOf.skuVariants.activeVariations` unguarded, so an
 * item built from a thinner query crashes it on render.
 */
export const query = gql(`
  query ArbRegistrationProductQuery($locator: [IStoreSelectedFacet!]!) {
    product(locator: $locator) {
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
      image {
        url
        alternateName
      }
      additionalProperty {
        propertyID
        name
        value
        valueReference
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
`)
