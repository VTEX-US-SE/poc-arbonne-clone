import { messagesFrom, postOrderForm, putOrderForm } from './orderForm'

/**
 * Matches `apps[].id` in the account's orderForm configuration. Checkout
 * rejects writes to an app or field that is not registered there, and the
 * order surfaces these under `customData.customApps[].id`.
 *
 * Lowercase deliberately: Checkout normalises the id, so `registrationForm`
 * comes back as `registrationform`. Keeping the stored form here means the
 * same constant is correct for reading the order later -- an exact-match
 * lookup on the camelCase spelling silently finds nothing.
 */
const APP_ID = 'registrationform'

export interface RegistrationInput {
  orderFormId?: string | null
  skuId: string
  customerType: string
  sponsorId: string
  birthDate?: string | null
  consultantComms: boolean
  textMarketing: boolean
  agreementVersion?: string | null
}

/**
 * Starts a registration: stamps the enrollment answers onto the cart as
 * customData, then adds the registration SKU.
 *
 * That order matters. customData first means a failure partway leaves answers
 * on a cart with nothing to pay for, which is harmless; the reverse leaves a
 * chargeable registration line with no record of who it belongs to.
 *
 * Server-side because `signedAt` is a legal record -- a browser clock is not
 * evidence of when someone accepted the terms -- and because the
 * one-per-account quantity guard must not be skippable from the client.
 */
export async function addRegistration({
  orderFormId,
  skuId,
  customerType,
  sponsorId,
  birthDate,
  consultantComms,
  textMarketing,
  agreementVersion,
}: RegistrationInput) {
  if (!skuId) {
    throw new Error('No registration SKU configured.')
  }

  const cartId = orderFormId ?? (await postOrderForm('', {})).orderFormId

  await putOrderForm(`/${cartId}/customData/${APP_ID}`, {
    customerType,
    sponsorId,
    birthDate: birthDate ?? '',
    consultantComms: String(consultantComms),
    textMarketing: String(textMarketing),
    agreementVersion: agreementVersion ?? '',
    signedAt: new Date().toISOString(),
  })

  let orderForm = await postOrderForm(`/${cartId}/items?sc=1`, {
    orderItems: [{ id: skuId, quantity: 1, seller: '1' }],
  })

  // Checkout merges a repeated SKU into its existing line and increments the
  // quantity, so a second submit -- browser back, double click -- would sell
  // two registrations. Registration is one-per-account, so clamp it back.
  const index = orderForm.items.findIndex((item) => item.id === skuId)

  if (index >= 0 && orderForm.items[index].quantity > 1) {
    orderForm = await postOrderForm(`/${cartId}/items/update?sc=1`, {
      orderItems: [{ index, quantity: 1 }],
    })
  }

  return {
    orderFormId: orderForm.orderFormId,
    value: orderForm.value,
    messages: messagesFrom(orderForm),
  }
}
