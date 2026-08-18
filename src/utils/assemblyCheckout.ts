import { request } from 'src/sdk/graphql/request'

import { addComposedSetMutation } from '../graphql/queries/addComposedSet'

/** One chosen child SKU, in the shape the composition expects. */
export interface SetSelection {
  skuId: string
  quantity: number
  seller: string
}

interface ComposedSetVariables {
  data: {
    orderFormId?: string
    parentSku: string
    sets: number
    items: SetSelection[]
  }
}

interface ComposedSetResult {
  arbAddComposedSet: {
    orderFormId: string
    value: number
    messages: string[]
  }
}

/**
 * Adds `sets` copies of a composed set to the cart.
 *
 * Thin wrapper over the `arbAddComposedSet` mutation -- every Checkout call it
 * makes runs server-side, so a dropped connection cannot leave the shopper with
 * orphan parent lines, and no orderForm endpoint is called from the browser.
 */
export async function addComposedSet({
  parentSku,
  selection,
  sets = 1,
  orderFormId,
}: {
  parentSku: string
  selection: SetSelection[]
  sets?: number
  orderFormId?: string
}) {
  const result = await request<ComposedSetResult, ComposedSetVariables>(
    addComposedSetMutation,
    { data: { orderFormId, parentSku, sets, items: selection } }
  )

  if (!result?.arbAddComposedSet) {
    throw new Error('Could not add this set.')
  }

  return result.arbAddComposedSet
}
