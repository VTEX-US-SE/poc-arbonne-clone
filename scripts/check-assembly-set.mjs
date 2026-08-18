/**
 * Self-check for the set-builder selection rules.
 * Run: node scripts/check-assembly-set.mjs
 *
 * The invariant worth protecting is that four things agree about what is in a
 * set: the min/max gate, the progress bar, the displayed price, and the
 * composition actually sent to Checkout. They read the same `quantities` map,
 * so stock has to be enforced where that map is built -- see `initialQuantities`.
 */
import assert from 'node:assert/strict'

import {
  groupTotal,
  initialQuantities,
  isGroupSatisfied,
  parseQtyParam,
  setBuilderHref,
  setSelection,
  MAX_QTY,
} from '../src/utils/assemblySet.ts'

const IN_STOCK = 'https://schema.org/InStock'
const OUT_OF_STOCK = 'https://schema.org/OutOfStock'

const item = (skuId, initialQuantity, available) => ({
  skuId,
  minQuantity: 0,
  maxQuantity: 4,
  initialQuantity,
  product: {
    sku: skuId,
    name: `Product ${skuId}`,
    image: [{ url: 'u', alternateName: '' }],
    offers: {
      offers: [
        {
          price: 90,
          listPrice: 90,
          availability: available ? IN_STOCK : OUT_OF_STOCK,
          seller: { identifier: '1' },
        },
      ],
    },
  },
})

// A group needing two items, where one eligible child is seeded non-zero but
// out of stock -- the shape that used to enable the CTA on an under-filled set.
const group = {
  name: 'Skincare items',
  minQuantity: 2,
  maxQuantity: 4,
  items: [item('IN', 1, true), item('OOS', 1, false)],
}
const groups = [group]

const quantities = initialQuantities(groups)
assert.equal(quantities.OOS, 0, 'an out-of-stock item must seed at 0')
assert.equal(quantities.IN, 1, 'an in-stock item keeps its initialQuantity')

const counted = groupTotal(group, quantities)
const sent = setSelection(groups, quantities).reduce(
  (total, line) => total + line.quantity,
  0
)
assert.equal(counted, sent, 'the gate and the composition must count the same')
assert.equal(
  isGroupSatisfied(group, quantities),
  false,
  'one in-stock item cannot satisfy a minimum of two'
)

// Guards the regression directly: seeding the out-of-stock item non-zero opened
// the gate while Checkout would only have received a single item.
const unguarded = { IN: 1, OOS: 1 }
assert.equal(isGroupSatisfied(group, unguarded), true)
assert.equal(setSelection(groups, unguarded).length, 1)

// Out-of-stock children never reach Checkout, which rejects a composition
// containing an unavailable SKU outright.
assert.equal(
  setSelection(groups, { IN: 0, OOS: 3 }).length,
  0,
  'an out-of-stock child must never be composed'
)

// The URL carries the PDP's quantity; it is user input, so it is bounded.
assert.equal(setBuilderHref('1657'), '/assembly-option?set=1657')
assert.equal(setBuilderHref('1657', 3), '/assembly-option?set=1657&qty=3')
assert.equal(parseQtyParam(String(MAX_QTY)), MAX_QTY)
for (const bad of [String(MAX_QTY + 1), '0', '-2', '2.5', 'abc', '', undefined]) {
  assert.equal(parseQtyParam(bad), undefined, `qty=${bad} must be rejected`)
}

console.log('set builder: all checks passed')
