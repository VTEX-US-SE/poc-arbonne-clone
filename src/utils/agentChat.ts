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

function asRecordsOrSingle(value: unknown): JsonRecord[] {
  if (Array.isArray(value)) {
    return value.filter(isRecord)
  }

  return isRecord(value) ? [value] : []
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

function parseRetailerId(value: string): { sku: string; seller: string } {
  if (!value.includes('#')) {
    return { sku: value, seller: '1' }
  }

  const parts = value.split('#').filter(Boolean)

  return {
    sku: parts[0] ?? value,
    seller: parts[parts.length - 1] ?? '1',
  }
}

function productFromRetailer(
  retailer: JsonRecord,
  fallbackName?: string
): AgentProduct | null {
  const retailerId =
    optionalString(retailer.retailer_id) ??
    optionalString(retailer.product_retailer_id)

  if (!retailerId) {
    return null
  }

  const ids = parseRetailerId(retailerId)

  return {
    sku: ids.sku,
    seller: optionalString(retailer.seller_id) ?? ids.seller,
    name:
      optionalString(retailer.name) ??
      fallbackName ??
      'Arbonne product',
    price: parsePrice(retailer.price),
    image: optionalString(retailer.image),
    url: optionalString(retailer.product_url),
  }
}

function productsFromCatalog(catalog: JsonRecord | undefined): AgentProduct[] {
  if (!catalog) {
    return []
  }

  const products: AgentProduct[] = []

  for (const product of asRecords(catalog.products)) {
    const fallbackName =
      optionalString(product.product) ?? optionalString(product.name)

    for (const retailer of asRecordsOrSingle(product.product_retailer_info)) {
      const parsed = productFromRetailer(retailer, fallbackName)

      if (parsed) {
        products.push(parsed)
      }
    }
  }

  if (products.length) {
    return products
  }

  for (const retailer of asRecordsOrSingle(catalog.product_retailer_info)) {
    const parsed = productFromRetailer(retailer)

    if (parsed) {
      products.push(parsed)
    }
  }

  return products
}

function productsFromCarousel(payload: JsonRecord): AgentProduct[] {
  const carousel = isRecord(payload.product_carousel)
    ? payload.product_carousel
    : undefined
  const products: AgentProduct[] = []

  for (const item of asRecordsOrSingle(carousel?.product_items)) {
    const parsed = productFromRetailer(item)

    if (parsed) {
      products.push(parsed)
    }
  }

  return products
}

function productsFromList(payload: JsonRecord): AgentProduct[] {
  const list = isRecord(payload.product_list) ? payload.product_list : undefined
  const products: AgentProduct[] = []

  for (const section of asRecords(list?.sections)) {
    for (const item of asRecordsOrSingle(section.product_items)) {
      const parsed = productFromRetailer(item)

      if (parsed) {
        products.push(parsed)
      }
    }
  }

  return products
}

function productsFromPayload(payload: JsonRecord): AgentProduct[] {
  const catalog = isRecord(payload.catalog_message)
    ? payload.catalog_message
    : undefined

  for (const source of [
    () => productsFromCatalog(catalog),
    () => productsFromCatalog(payload),
    () => productsFromCarousel(payload),
    () => productsFromList(payload),
  ]) {
    const products = source()

    if (products.length) {
      return products
    }
  }

  return []
}

function headerFromPayload(payload: JsonRecord): string | undefined {
  if (isRecord(payload.header)) {
    return optionalString(payload.header.text)
  }

  return optionalString(payload.header)
}

function parsePayload(raw: string): JsonRecord | null {
  const trimmed = raw.trim()

  if (!trimmed.startsWith('{')) {
    return null
  }

  try {
    let payload: unknown = JSON.parse(trimmed)

    if (typeof payload === 'string') {
      payload = JSON.parse(payload)
    }

    return isRecord(payload) ? payload : null
  } catch {
    return null
  }
}

function parseAgentPayload(
  raw: string
): Pick<AgentChatMessage, 'text' | 'products' | 'header'> {
  const payload = parsePayload(raw)

  if (!payload) {
    return { text: raw }
  }

  const products = productsFromPayload(payload)

  return {
    text: optionalString(payload.text) ?? (products.length ? '' : raw),
    products: products.length ? products : undefined,
    header: headerFromPayload(payload),
  }
}

export function parseAgentText(
  raw: string
): Pick<AgentChatMessage, 'text' | 'products' | 'header'> {
  return parseAgentMessage(raw)
}

export function parseAgentMessage(
  text: string,
  attachments: string[] = []
): Pick<AgentChatMessage, 'text' | 'products' | 'header'> {
  const candidates = [text, ...attachments.filter(Boolean)]

  for (const candidate of candidates) {
    const parsed = parseAgentPayload(candidate)

    if (parsed.products?.length) {
      if (!parsed.text && candidate === text) {
        parsed.text = optionalString(parsePayload(text)?.text) ?? ''
      }

      return parsed
    }
  }

  return parseAgentPayload(text)
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
