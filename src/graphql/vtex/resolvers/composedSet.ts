import { messagesFrom, postOrderForm, type OrderForm } from './orderForm'

export interface ComposedSetInput {
  orderFormId?: string | null
  parentSku: string
  sets: number
  items: Array<{ skuId: string; quantity: number; seller: string }>
}

/** Highest number of copies a single call will compose -- each costs two requests. */
const MAX_SETS = 10

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
    : await postOrderForm('', {})

  for (let copy = 0; copy < copies; copy++) {
    const withParent = await postOrderForm(
      `/${orderForm.orderFormId}/items?sc=1`,
      {
        orderItems: [{ id: parentSku, quantity: 1, seller: '1' }],
      }
    )

    const assemblyId = assemblyIdFor(withParent, parentSku)
    const parentIndex = uncomposedParentIndex(withParent, parentSku)

    if (!assemblyId || parentIndex < 0) {
      throw new Error('This set is not configured as an assembly in Checkout.')
    }

    orderForm = await postOrderForm(
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
    messages: messagesFrom(orderForm),
  }
}
