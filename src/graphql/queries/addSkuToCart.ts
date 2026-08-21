import { gql } from '@generated'

/**
 * Adds one SKU to the cart server-side. Used by CTAs that redirect straight to
 * checkout, where the storefront's own cart never has to describe the product.
 */
export const addSkuToCartMutation = gql(`
  mutation ArbAddSkuToCart($data: ArbAddSkuInput!) {
    arbAddSkuToCart(data: $data) {
      orderFormId
      value
      messages
    }
  }
`)
