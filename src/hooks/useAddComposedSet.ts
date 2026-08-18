import { useCallback, useState } from 'react'
import { request } from 'src/sdk/graphql/request'

import type { SetSelection } from '../components/AssemblySet/AssemblySet.types'
import { addComposedSetMutation } from '../graphql/queries/addComposedSet'

interface ComposedSetVariables {
  data: {
    orderFormId?: string
    parentSku: string
    sets: number
    items: SetSelection[]
  }
}

interface ComposedSetResponse {
  arbAddComposedSet: {
    orderFormId: string
    value: number
    messages: string[]
  }
}

/** What the confirmation needs once a set is in the cart. */
export interface ComposedSetSummary {
  /** Cart total in currency units -- Checkout reports cents. */
  total: number
  /** First Checkout warning, e.g. a quantity limit that was clamped. */
  notice?: string
  orderFormId: string
}

/**
 * Adds copies of a composed set to the cart, with the pending, result and error
 * state the CTA and confirmation need.
 *
 * A hook rather than a util because it performs I/O -- `src/utils/` is for pure
 * helpers. It mirrors core's own cart hooks (`useBuyButton`,
 * `useCartToggleButton`), which likewise hand back a handler plus its state.
 *
 * Every Checkout call happens server-side behind the `arbAddComposedSet`
 * mutation, so a dropped connection cannot strand orphan parent lines in the
 * shopper's cart.
 */
export default function useAddComposedSet() {
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState<ComposedSetSummary | null>(null)
  const [error, setError] = useState<string | null>(null)

  const addSet = useCallback(
    async ({
      parentSku,
      selection,
      sets = 1,
      orderFormId,
    }: {
      parentSku?: string
      selection: SetSelection[]
      sets?: number
      orderFormId?: string
    }) => {
      if (!parentSku || selection.length === 0) {
        return
      }

      setAdding(true)
      setError(null)

      try {
        const response = await request<
          ComposedSetResponse,
          ComposedSetVariables
        >(addComposedSetMutation, {
          data: { orderFormId, parentSku, sets, items: selection },
        })
        const composed = response?.arbAddComposedSet

        if (!composed) {
          throw new Error('Could not add this set.')
        }

        setAdded({
          total: composed.value / 100,
          notice: composed.messages?.[0],
          orderFormId: composed.orderFormId,
        })
      } catch (caught) {
        setError(
          caught instanceof Error ? caught.message : 'Could not add this set.'
        )
      } finally {
        setAdding(false)
      }
    },
    []
  )

  const dismiss = useCallback(() => setAdded(null), [])

  return { addSet, adding, added, error, dismiss }
}
