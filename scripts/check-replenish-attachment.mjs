/**
 * Self-check for the ReplenishMe cart attachment.
 * Run: node scripts/check-replenish-attachment.mjs
 *
 * The shape here is what `validateCart` reads: it filters `additionalProperty`
 * on `valueReference === 'ATTACHMENT'`, sends `{name, content: value}` to
 * Checkout, and hashes the same entries into the cart line's identity key. Get
 * the shape wrong and nothing throws -- the item is added as a plain one-time
 * purchase and no subscription is ever generated.
 */
import assert from 'node:assert/strict'

import {
  frequenciesFromDomain,
  replenishAttachment,
  REPLENISH_ATTACHMENT,
  REPLENISH_FREQUENCY_FIELD,
} from '../src/utils/replenish.ts'

// The domain exactly as the arbonnepoc catalog registers it, on all 48 SKUs
// carrying the plan.
const DOMAIN = '1 month, 2 month, 3 month'

const cadences = frequenciesFromDomain(DOMAIN)

// Comma-separated with a space after each comma, and VTEX validates the cart
// attachment against a plain split -- so the second and third values really do
// keep their leading space. Trimming them breaks checkout, silently.
assert.deepEqual(cadences, [
  { value: '1 month', label: 'Every month' },
  { value: ' 2 month', label: 'Every 2 months' },
  { value: ' 3 month', label: 'Every 3 months' },
])

// A product with no plan yields no cadences, which is what hides the option.
assert.deepEqual(frequenciesFromDomain(''), [])

// An unrecognised cadence still renders, labelled with its own value.
assert.deepEqual(frequenciesFromDomain('2 week, ,quarterly'), [
  { value: '2 week', label: 'Every 2 weeks' },
  { value: 'quarterly', label: 'quarterly' },
])

// A one-time purchase carries nothing, whatever the frequency picker holds.
assert.deepEqual(replenishAttachment('oneTime', '1 month'), [])

// Replenish with no cadence carries nothing either -- an empty CMS frequency
// list must not send an attachment Checkout cannot resolve.
assert.deepEqual(replenishAttachment('replenish', ''), [])

const [attachment] = replenishAttachment('replenish', '1 month')

assert.equal(attachment.name, REPLENISH_ATTACHMENT)
assert.equal(attachment.valueReference, 'ATTACHMENT')

// `value` MUST be the content object. It reaches Checkout as `content`
// verbatim; a JSON string of the same data is answered with 400 CHK0140,
// which fails the whole cart sync rather than just this item.
assert.equal(typeof attachment.value, 'object')

// `dr` in @faststore/api maps the property to Checkout as {name, content}.
assert.deepEqual(
  { name: attachment.name, content: attachment.value },
  {
    name: 'vtex.subscription.replenishme',
    content: { 'vtex.subscription.key.frequency': '1 month' },
  }
)

// Core keys local cart lines on propertyID, so two cadences must not share one
// -- otherwise monthly and quarterly of the same SKU merge into a single line.
const [monthly] = replenishAttachment('replenish', '1 month')
const [quarterly] = replenishAttachment('replenish', ' 3 month')

assert.notEqual(monthly.propertyID, quarterly.propertyID)
assert.notEqual(monthly.value, quarterly.value)

// The cadence chosen on the PDP round-trips into the attachment unmodified --
// leading space and all, since that is what VTEX validates the content against.
const [second] = replenishAttachment('replenish', cadences[1].value)

assert.deepEqual(second.value, { [REPLENISH_FREQUENCY_FIELD]: ' 2 month' })

console.log('check-replenish-attachment: ok')
