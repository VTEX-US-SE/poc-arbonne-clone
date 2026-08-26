import type { AgentChatMessage, AgentProduct } from '../components/BeautyConsultant/BeautyConsultant.types'

interface SearchProductNode {
  slug?: string | null
  sku?: string | null
  name?: string | null
  image?: Array<{ url?: string | null } | null> | null
  offers?: {
    lowPrice?: number | null
    offers?: Array<{
      seller?: { identifier?: string | null } | null
    } | null> | null
  } | null
}

export function toAgentProductFromSearch(node: SearchProductNode): AgentProduct | null {
  const sku = node.sku?.trim()

  if (!sku || !node.slug) {
    return null
  }

  return {
    sku,
    seller: node.offers?.offers?.[0]?.seller?.identifier ?? '1',
    name: node.name?.trim() || 'Arbonne product',
    price: node.offers?.lowPrice ?? undefined,
    image: node.image?.[0]?.url ?? undefined,
    url: `/${node.slug}/p`,
  }
}

export function searchTermForAgentMessage(
  thread: AgentChatMessage[],
  index: number
): string | undefined {
  const message = thread[index]

  if (message?.direction !== 'out' || message.products?.length) {
    return undefined
  }

  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    if (thread[cursor]?.direction === 'in') {
      return thread[cursor].text.trim() || undefined
    }
  }

  return undefined
}

/** When Weni returns plain text, attach a catalog shelf from Intelligent Search. */
export function shouldEnrichWithSearch(
  thread: AgentChatMessage[],
  index: number
): boolean {
  const message = thread[index]

  if (message.direction !== 'out' || message.products?.length) {
    return false
  }

  if (
    thread
      .slice(index + 1)
      .some((entry) => entry.direction === 'out' && entry.products?.length)
  ) {
    return false
  }

  if (
    thread
      .slice(index + 1)
      .some((entry) => entry.direction === 'out' && !entry.products?.length)
  ) {
    return false
  }

  return Boolean(searchTermForAgentMessage(thread, index))
}

export const SEARCH_SHELF_HEADER = 'Matching products'
