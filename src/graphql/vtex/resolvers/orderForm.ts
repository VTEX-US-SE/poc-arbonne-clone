import storeConfig from 'discovery.config'

export interface OrderFormItem {
  id: string
  quantity: number
  parentItemIndex: number | null
}

export interface OrderForm {
  orderFormId: string
  value: number
  items: OrderFormItem[]
  itemMetadata?: {
    items?: Array<{ id: string; assemblyOptions?: Array<{ id: string }> }>
  }
  messages?: Array<{ text?: string }>
}

/**
 * Our own store domain, not `vtexcommercestable` -- AGENTS.md forbids resolvers
 * calling the platform host directly, and the store domain keeps the request in
 * the store's own edge context.
 */
const base = storeConfig.storeUrl

async function send(
  method: 'POST' | 'PUT',
  path: string,
  body: unknown
): Promise<OrderForm> {
  const response = await fetch(`${base}/api/checkout/pub/orderForm${path}`, {
    method,
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

/** POST to Checkout's public orderForm API, returning the updated orderForm. */
export const postOrderForm = (path: string, body: unknown) =>
  send('POST', path, body)

/** PUT to Checkout's public orderForm API, returning the updated orderForm. */
export const putOrderForm = (path: string, body: unknown) =>
  send('PUT', path, body)

/** Cart warnings Checkout reports, e.g. a quantity limit that was clamped. */
export function messagesFrom(orderForm: OrderForm) {
  return (orderForm.messages ?? [])
    .map((message) => message.text)
    .filter((text): text is string => Boolean(text))
}
