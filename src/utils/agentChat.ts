import type {
  AgentChatMessage,
  AgentProduct,
} from '../components/BeautyConsultant/BeautyConsultant.types'

interface JsonRecord {
  [key: string]: unknown
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null
}

function asRecords(value: unknown): JsonRecord[] {
  return Array.isArray(value) ? value.filter(isRecord) : []
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined
}

function parsePrice(value: unknown): number | undefined {
  if (typeof value !== 'number' && typeof value !== 'string') {
    return undefined
  }

  const parsed = Number.parseFloat(String(value).replace(',', '.'))

  return Number.isFinite(parsed) ? parsed : undefined
}

export function parseAgentText(
  raw: string
): Pick<AgentChatMessage, 'text' | 'products' | 'header'> {
  const trimmed = raw.trim()

  if (!trimmed.startsWith('{')) {
    return { text: raw }
  }

  try {
    const payload: unknown = JSON.parse(trimmed)

    if (!isRecord(payload)) {
      return { text: raw }
    }

    const catalog = isRecord(payload.catalog_message)
      ? payload.catalog_message
      : undefined
    const products: AgentProduct[] = []

    for (const product of asRecords(catalog?.products)) {
      for (const retailer of asRecords(product.product_retailer_info)) {
        const sku = optionalString(retailer.retailer_id)

        if (!sku) {
          continue
        }

        products.push({
          sku,
          seller: optionalString(retailer.seller_id) ?? '1',
          name:
            optionalString(retailer.name) ??
            optionalString(product.product) ??
            'Arbonne product',
          price: parsePrice(retailer.price),
          image: optionalString(retailer.image),
          url: optionalString(retailer.product_url),
        })
      }
    }

    const header = isRecord(payload.header)
      ? optionalString(payload.header.text)
      : undefined

    return {
      text: optionalString(payload.text) ?? (products.length ? '' : raw),
      products: products.length ? products : undefined,
      header,
    }
  } catch {
    return { text: raw }
  }
}

export function safeProductHref(
  value: string | undefined,
  currentOrigin: string
): string | null {
  if (!value) {
    return null
  }

  try {
    const url = new URL(value, currentOrigin)

    if (url.origin !== currentOrigin || !/^https?:$/.test(url.protocol)) {
      return null
    }

    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return null
  }
}
