import { useCallback, useState } from 'react'
import { request } from 'src/sdk/graphql/request'

import { addSkuToCartMutation } from '../graphql/queries/addSkuToCart'

interface Variables {
  data: { skuId: string; orderFormId?: string }
}

interface Response {
  arbAddSkuToCart: {
    orderFormId: string
    value: number
    messages: string[]
  }
}

/**
 * Adds one SKU to the cart, with the pending and error state a CTA needs.
 * Mirrors `useAddRegistration` -- a hook rather than a util because it performs
 * I/O.
 *
 * Resolves to the orderForm id on success and `null` on failure, so the caller
 * can redirect without also reading state that has not re-rendered yet.
 */
export default function useAddSkuToCart() {
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addSku = useCallback(
    async (payload: { skuId: string; orderFormId?: string }) => {
      setAdding(true)
      setError(null)

      try {
        const response = await request<Response, Variables>(
          addSkuToCartMutation,
          { data: payload }
        )
        const added = response?.arbAddSkuToCart

        if (!added) {
          throw new Error('Could not add this to your cart.')
        }

        return added.orderFormId
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : 'Could not add this to your cart.'
        )

        return null
      } finally {
        setAdding(false)
      }
    },
    []
  )

  return { addSku, adding, error }
}
