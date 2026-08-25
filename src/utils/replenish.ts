import type { PurchaseOption } from '../components/ProductDetails/ProductDetails.types'

/**
 * The subscription plan as registered on the arbonnepoc account, and the
 * attachment field carrying the cadence. VTEX only generates a subscription
 * from an order whose cart line carries this attachment.
 */
export const REPLENISH_ATTACHMENT = 'vtex.subscription.replenishme'
export const REPLENISH_FREQUENCY_FIELD = 'vtex.subscription.key.frequency'

export interface ReplenishFrequency {
  value: string
  label: string
}

/**
 * `1 month` -> `Every month`, `3 month` -> `Every 3 months`. Anything the
 * pattern does not recognise falls back to the trimmed domain value, so a
 * cadence added in Admin later shows up readable rather than not at all.
 */
function frequencyLabel(value: string): string {
  const match = /^(\d+)\s+(\w+?)s?$/.exec(value.trim())

  if (!match) {
    return value.trim()
  }

  const [, count, unit] = match

  return count === '1' ? `Every ${unit}` : `Every ${count} ${unit}s`
}

/**
 * Splits the plan's registered frequency domain into selectable cadences.
 *
 * **`value` keeps the domain string's own spacing.** VTEX registers the domain
 * as `"1 month, 2 month, 3 month"` and validates the cart attachment against a
 * plain comma split, so the second and third cadences really are `" 2 month"`
 * and `" 3 month"`, leading space included. Trimming here would produce a
 * value Checkout silently rejects. Only the label is trimmed.
 */
export function frequenciesFromDomain(
  domainValues: string
): ReplenishFrequency[] {
  return domainValues
    .split(',')
    .filter((value) => value.trim())
    .map((value) => ({ value, label: frequencyLabel(value) }))
}

/** Shape `validateCart` recognises as a Checkout attachment. */
export interface AttachmentProperty {
  propertyID: string
  name: string
  value: Record<string, string>
  valueReference: 'ATTACHMENT'
}

/**
 * The subscription plan as an `additionalProperty` entry, ready to append to
 * the `itemOffered` handed to `useBuyButton`.
 *
 * FastStore round-trips attachments through the cart itself: `validateCart`
 * turns every `ATTACHMENT`-flagged property into a Checkout `attachments`
 * entry, and folds it into the cart line's identity key -- so a ReplenishMe
 * line and a one-time line of the same SKU stay separate, and the plan
 * survives later cart edits. Attaching it out-of-band after add-to-cart would
 * be undone by the next cart sync.
 *
 * Empty for a one-time purchase, and for a replenish selection with no
 * cadence -- an empty frequency list would otherwise send an attachment
 * Checkout cannot resolve.
 *
 * **`value` must be the content object, not a JSON string of it.** It is typed
 * as the `ObjectOrString` scalar, whose declared input coercion parses strings
 * and nulls everything else -- but that coercion is not applied on this path,
 * so whatever is sent reaches Checkout as `content` verbatim. An object works;
 * a JSON string arrives as a string and Checkout answers `400 CHK0140 The name
 * of attachment is invalid`, which fails the entire cart sync, not just this
 * item. Verified against a real orderForm; do not "fix" this to a string.
 *
 * `propertyID` is ours rather than the server's hash: core keys local cart
 * lines on it, and without one every cadence collapses to the same key, so
 * monthly and quarterly of the same SKU would merge into one line until the
 * next sync pulled them apart.
 */
export function replenishAttachment(
  purchaseOption: PurchaseOption,
  frequency: string
): AttachmentProperty[] {
  if (purchaseOption !== 'replenish' || !frequency) {
    return []
  }

  return [
    {
      propertyID: `${REPLENISH_ATTACHMENT}:${frequency}`,
      name: REPLENISH_ATTACHMENT,
      value: { [REPLENISH_FREQUENCY_FIELD]: frequency },
      valueReference: 'ATTACHMENT',
    },
  ]
}
