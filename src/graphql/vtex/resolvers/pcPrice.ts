import storeConfig from 'discovery.config'

/**
 * Trade policy carrying the Preferred Client price on this account. A public
 * price table -- Intelligent Search serves it to anyone who names it, so this
 * needs no credentials and does not depend on who is signed in.
 */
const PC_PRICE_TABLE = 'preferredclient'

/** Our own store domain, per AGENTS.md -- never `vtexcommercestable` directly. */
const base = storeConfig.storeUrl

interface SkuRoot {
  itemId?: string
  sellers?: Array<{ commertialOffer?: { Price?: number } }>
}

interface Ctx {
  storage?: { channel?: { salesChannel?: string }; locale?: string }
}

interface IsOffer {
  Price?: number
  ListPrice?: number
}

interface IsProduct {
  items?: Array<{ sellers?: Array<{ commertialOffer?: IsOffer }> }>
}

/**
 * One SKU's offer from a named price table, via the single-SKU Intelligent
 * Search read (`products?field=sku`) -- the one that returned stable prices
 * under testing where `product-search` flapped. `null` on any failure.
 */
async function fetchTableOffer(
  sku: string,
  table: string,
  ctx: Ctx
): Promise<IsOffer | null> {
  const params = new URLSearchParams({
    field: 'sku',
    value: sku,
    locale: ctx.storage?.locale ?? '',
    sc: ctx.storage?.channel?.salesChannel ?? '1',
    priceTables: table,
  })

  try {
    const response = await fetch(
      `${base}/api/intelligent-search/v1/products?${params.toString()}`,
      { headers: { accept: 'application/json' } }
    )

    if (!response.ok) {
      console.error('[arb] price lookup failed', sku, table, response.status)

      return null
    }

    const product: IsProduct = await response.json()

    return product.items?.[0]?.sellers?.[0]?.commertialOffer ?? null
  } catch (error) {
    console.error('[arb] price lookup errored', sku, table, error)

    return null
  }
}

/**
 * The Preferred Client price for one SKU, fetched from the `preferredclient`
 * price table. Returns the fully-promoted `Price` -- the green figure prod
 * shows -- since promotions stack on top of the table price exactly as they do
 * for the shopper's own price.
 *
 * A second Intelligent Search read per SKU: VTEX computes one price table per
 * response, so a guest page that wants both the retail price and the PC price
 * has to ask twice.
 *
 * Suppressed (null) when it is not below the SKU's own selling price -- some
 * SKUs' promo floor already beats the 20%, and a PC line at or above the price
 * paid is noise, not a saving.
 *
 * ponytail: one HTTP call per SKU, only when `pcPrice` is selected. Fine for
 * the shelf sizes here; batch through a DataLoader if a grid ever asks for it
 * across a full page.
 */
export async function pcPrice(root: SkuRoot, ctx: Ctx): Promise<number | null> {
  const sku = root.itemId

  if (!sku) return null

  const sellingPrice = root.sellers?.[0]?.commertialOffer?.Price
  const offer = await fetchTableOffer(sku, PC_PRICE_TABLE, ctx)
  const price = offer?.Price

  if (price === undefined) return null

  // Nothing to advertise when the shopper already pays this or less.
  if (sellingPrice !== undefined && price >= sellingPrice) return null

  return price
}

/**
 * The retail *sale* price for one SKU -- the promoted `Price` from the `retail`
 * trade policy, which carries the promotion regardless of who is signed in.
 * This is the "SALE PRICE" column: the price the general public pays when a
 * promo is running, distinct from any tier discount.
 *
 * Null unless retail is genuinely on promo (its `Price` is below its own SRP).
 * A tier discount alone (e.g. a Consultant paying below SRP with no promotion)
 * is not a sale and must not surface here -- otherwise it just duplicates
 * YOUR PRICE.
 */
export async function salePrice(root: SkuRoot, ctx: Ctx): Promise<number | null> {
  const sku = root.itemId

  if (!sku) return null

  const offer = await fetchTableOffer(sku, 'retail', ctx)

  if (offer?.Price === undefined) return null

  const srp = offer.ListPrice ?? offer.Price

  return offer.Price < srp ? offer.Price : null
}
