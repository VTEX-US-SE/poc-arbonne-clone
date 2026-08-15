/**
 * Self-check for the assembly-option composition parser.
 * Run: node scripts/check-composition.mjs
 *
 * Cases below are real strings observed on the `arbonnepoc` account plus the
 * syntax from VTEX's own docs, so a regression here means the parser stopped
 * matching what the platform actually emits.
 */
import assert from 'node:assert/strict'

import {
  parseAttachment,
  parseComposition,
} from '../src/graphql/vtex/resolvers/parseComposition.ts'

// Real string from attachment 3 on SKU 1657: trailing `;`, no price tables.
const live = parseComposition(
  'Skincare items',
  '[1-4]#1[0-4][0];#4373[0-4][0];'
)
assert.equal(live.name, 'Skincare items')
assert.equal(live.minQuantity, 1)
assert.equal(live.maxQuantity, 4)
assert.equal(live.items.length, 2, 'trailing semicolon must not add an item')
assert.deepEqual(live.items[0], {
  skuId: '1',
  minQuantity: 0,
  maxQuantity: 4,
  initialQuantity: 0,
  priceTable: null,
})

// VTEX documented syntax: price tables present, no trailing separator.
const documented = parseComposition(
  'Items',
  '[0-3]#10000[1-2][1]pricetable1;#20000[0-2][0]pricetable2'
)
assert.equal(documented.minQuantity, 0)
assert.equal(documented.maxQuantity, 3)
assert.equal(documented.items[0].priceTable, 'pricetable1')
assert.equal(documented.items[1].initialQuantity, 0)

// Non-composition attachments (plain text fields) must be rejected, not
// half-parsed -- this is what keeps ordinary attachments out of the UI.
assert.equal(parseComposition('Nome', 'Any text here'), null)
assert.equal(parseComposition('Empty', '[1-4]'), null)

// Intelligent Search shape: nested `fields[].domain_values`, snake_case.
const fromSearch = parseAttachment({
  id: 3,
  name: 'vtex.assembly-option.Build Your Best Skin',
  isRequired: false,
  fields: [
    {
      field_name: 'Skincare items',
      domain_values: '[1-4]#1[0-4][0];#4373[0-4][0];',
    },
  ],
})
assert.equal(fromSearch.length, 1)
assert.equal(fromSearch[0].items.length, 2)

// Legacy catalog shape: flat `domainValues` holding a JSON *string*.
const fromCatalog = parseAttachment({
  id: 3,
  name: 'vtex.assembly-option.Build Your Best Skin',
  required: false,
  domainValues:
    '[{"FieldName":"Skincare items","MaxCaracters":null,"DomainValues":"[1-4]#1[0-4][0];#4373[0-4][0];"}]',
})
assert.deepEqual(fromCatalog, fromSearch, 'both shapes must parse identically')

// Malformed input hides the set instead of throwing.
assert.deepEqual(parseAttachment({ domainValues: 'not json' }), [])
assert.deepEqual(parseAttachment({}), [])

console.log('composition parser: all checks passed')
