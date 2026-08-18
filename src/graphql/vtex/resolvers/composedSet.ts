import storeConfig from 'discovery.config'

export interface ComposedSetInput {
  orderFormId?: string | null
  parentSku: string
  sets: number
  items: Array<{ skuId: string; quantity: number; seller: string }>
}

interface OrderFormItem {
  id: string
  parentItemIndex: number | null
}

interface OrderForm {
  orderFormId: string
  value: number
  items: OrderFormItem[]
  itemMetadata?: {
    items?: Array<{ id: string; assemblyOptions?: Array<{ id: string }> }>
  }
  messages?: Array<{ text?: string }>
}

/** Highest number of copies a single call will compose -- each costs two requests. */
const MAX_SETS = 10

/**
 * Our own store domain, not `vtexcommercestable` -- AGENTS.md forbids resolvers
 * calling the platform host directly, and the store domain keeps the request in
 * the store's own edge context.
 */
const base = storeConfig.storeUrl

async function post(path: string, body: unknown): Promise<OrderForm> {
  const response = await fetch(`${base}/api/checkout/pub/orderForm${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const detail = await response.json().catch(() => null)

    throw new Error(
      detail?.error?.message ?? `Checkout returned ${response.status}`
    )
  }

  return response.json()
}

/**
 * The `assemblyId` Checkout expects, read off the orderForm rather than built
 * from catalog data: the real id is `{attachmentName}_{groupName}`, and that
 * shape belongs to VTEX.
 */
function assemblyIdFor(orderForm: OrderForm, parentSku: string) {
  return orderForm.itemMetadata?.items?.find((item) => item.id === parentSku)
    ?.assemblyOptions?.[0]?.id
}

/**
 * Index of the parent line that has no children pointing at it yet -- the one
 * just added. Composed parents are excluded by scanning every item's
 * `parentItemIndex`.
 */
function uncomposedParentIndex(orderForm: OrderForm, parentSku: string) {
  const composed = new Set(
    orderForm.items
      .map((item) => item.parentItemIndex)
      .filter((index): index is number => index !== null)
  )

  return orderForm.items.findIndex(
    (item, index) =>
      item.id === parentSku &&
      item.parentItemIndex === null &&
      !composed.has(index)
  )
}

/**
 * Adds `sets` copies of a composed set to an orderForm.
 *
 * Each copy is its own parent line, composed individually. One parent with
 * scaled children is not equivalent: Checkout rejects a composition whose
 * quantities are not a multiple of the parent quantity (`CHK0023`), and the
 * per-item and per-group maxima are absolute per line, so scaling to match
 * trips `itemMaxQuantityLimitReached` instead.
 *
 * Sequential because each call returns new orderForm state, and copy N's parent
 * index depends on the lines copy N-1 added.
 */
export async function addComposedSet({
  orderFormId,
  parentSku,
  sets,
  items,
}: ComposedSetInput) {
  if (items.length === 0) {
    throw new Error('Nothing selected for this set.')
  }

  const copies = Math.min(Math.max(sets, 1), MAX_SETS)
  let orderForm = orderFormId
    ? ({ orderFormId } as OrderForm)
    : await post('', {})

  for (let copy = 0; copy < copies; copy++) {
    const withParent = await post(`/${orderForm.orderFormId}/items?sc=1`, {
      orderItems: [{ id: parentSku, quantity: 1, seller: '1' }],
    })

    const assemblyId = assemblyIdFor(withParent, parentSku)
    const parentIndex = uncomposedParentIndex(withParent, parentSku)

    if (!assemblyId || parentIndex < 0) {
      throw new Error('This set is not configured as an assembly in Checkout.')
    }

    orderForm = await post(
      `/${withParent.orderFormId}/items/${parentIndex}/assemblyOptions/${encodeURIComponent(assemblyId)}?sc=1`,
      {
        composition: {
          items: items.map(({ skuId, quantity, seller }) => ({
            id: skuId,
            quantity,
            seller,
          })),
        },
        inputValues: {},
      }
    )
  }

  return {
    orderFormId: orderForm.orderFormId,
    value: orderForm.value,
    messages: (orderForm.messages ?? [])
      .map((message) => message.text)
      .filter((text): text is string => Boolean(text)),
  }
}
