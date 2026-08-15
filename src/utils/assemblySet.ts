import type {
  AssemblyGroup,
  AssemblyItem,
} from '../components/AssemblySet/AssemblySet.types'

const IN_STOCK = 'https://schema.org/InStock'

/**
 * Expands the tokens allowed in CMS copy against one group, so the text
 * follows the composition instead of restating it. Unknown tokens are left
 * untouched rather than blanked, which makes a typo visible in the UI.
 */
export const expandTokens = (
  text: string,
  tokens: { min: number; max: number; selected: number }
) =>
  text.replace(/\{(min|max|selected)\}/g, (_match, key: keyof typeof tokens) =>
    String(tokens[key])
  )

export const bestOffer = (item: AssemblyItem) =>
  item.product?.offers?.offers?.[0]

export const isInStock = (item: AssemblyItem) =>
  bestOffer(item)?.availability === IN_STOCK

/** Total picked across one group -- this is what the min/max gate measures. */
export const groupTotal = (
  group: AssemblyGroup,
  quantities: Record<string, number>
) => group.items.reduce((sum, item) => sum + (quantities[item.skuId] ?? 0), 0)

export const isGroupSatisfied = (
  group: AssemblyGroup,
  quantities: Record<string, number>
) => {
  const total = groupTotal(group, quantities)

  return total >= group.minQuantity && total <= group.maxQuantity
}
