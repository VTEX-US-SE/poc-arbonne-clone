import type {
  AssemblyGroup,
  AssemblyItem,
} from '../components/AssemblySet/AssemblySet.types'

const IN_STOCK = 'https://schema.org/InStock'

/** Query-string keys the set builder reads. */
export const SET_PARAM = 'set'
export const QTY_PARAM = 'qty'

/** Highest quantity accepted from the URL -- see `setBuilderHref`. */
const MAX_QTY = 99

/**
 * Link into the set builder for a parent product, carrying how many copies of
 * the set the shopper asked for on the PDP. One page serves every set (see
 * `docs/assembly-options.md`), so both travel in the query string. `sets` is
 * omitted at 1 to keep the common URL clean.
 */
export const setBuilderHref = (productId: string, sets = 1) =>
  `/assembly-option?${SET_PARAM}=${productId}` +
  (sets > 1 ? `&${QTY_PARAM}=${sets}` : '')

/**
 * Parses the `qty` query value. The URL is user-controlled, so anything that
 * is not a whole number in `1..MAX_QTY` falls back to `undefined` and leaves
 * the stepper on its default -- an unbounded value here would multiply straight
 * into the displayed totals.
 */
export const parseQtyParam = (value: string | string[] | undefined) => {
  const parsed = Number(value)

  return Number.isInteger(parsed) && parsed >= 1 && parsed <= MAX_QTY
    ? parsed
    : undefined
}

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

/** The offer a child SKU is sold at -- first seller wins, as elsewhere. */
export const bestOffer = (item: AssemblyItem) =>
  item.product?.offers?.offers?.[0]

/** Whether a child SKU can currently be added to a set. */
export const isInStock = (item: AssemblyItem) =>
  bestOffer(item)?.availability === IN_STOCK

/** Total picked across one group -- this is what the min/max gate measures. */
export const groupTotal = (
  group: AssemblyGroup,
  quantities: Record<string, number>
) => group.items.reduce((sum, item) => sum + (quantities[item.skuId] ?? 0), 0)

/** Whether a group's own min/max gate is met, which is what opens the CTA. */
export const isGroupSatisfied = (
  group: AssemblyGroup,
  quantities: Record<string, number>
) => {
  const total = groupTotal(group, quantities)

  return total >= group.minQuantity && total <= group.maxQuantity
}

/**
 * The composed set as cart items -- one per selected child SKU, its quantity
 * multiplied by how many copies of the set were asked for.
 *
 * The children go in individually rather than as a VTEX assembly, because
 * Checkout does not yet register the attachment as an assembly option (see
 * `docs/assembly-options.md`). Swap this for the composition endpoint once that
 * is resolved; the call site does not change.
 */
export const setCartItems = (
  groups: AssemblyGroup[],
  quantities: Record<string, number>,
  sets: number
) =>
  groups
    .flatMap((group) => group.items)
    .flatMap((item) => {
      const offer = bestOffer(item)
      const quantity = (quantities[item.skuId] ?? 0) * sets

      if (!item.product || !offer || quantity === 0) {
        return []
      }

      const { product } = item

      return [
        {
          id: product.id,
          price: offer.price,
          priceWithTaxes: offer.priceWithTaxes,
          listPrice: offer.listPrice,
          listPriceWithTaxes: offer.listPriceWithTaxes,
          seller: offer.seller,
          quantity,
          itemOffered: {
            sku: product.sku,
            name: product.name,
            gtin: product.gtin,
            image: [product.image?.[0]],
            brand: product.brand,
            isVariantOf: product.isVariantOf,
            additionalProperty: product.additionalProperty,
            unitMultiplier: product.unitMultiplier,
          },
        },
      ]
    })
