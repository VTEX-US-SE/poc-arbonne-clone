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

const BRAND_PREFIX =
  /\b((?:BodyCare|DermResults|HydrateMe|Arbonne|RE9|Nutri|Protein|Speak)[^,.\n!?]*)/gi

const SKIP_NAME =
  /^(yes|no|i|we|the|this|that|these|those|if|when|for|and|or|but|so|hi|hello|great|absolutely|perfect|wonderful|here|let|you|your|they|their|our|arbonne|sure|happy|glad|also|first|next|then|finally)$/i

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

function addUniqueName(names: string[], seen: Set<string>, value: string) {
  const clean = value.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim()

  if (clean.length < 4) {
    return
  }

  const key = clean.toLowerCase()

  if (seen.has(key) || SKIP_NAME.test(clean.split(' ')[0] ?? '')) {
    return
  }

  seen.add(key)
  names.push(clean)
}

function forEachRegexMatch(
  text: string,
  pattern: RegExp,
  onMatch: (match: RegExpExecArray) => void
) {
  const regex = new RegExp(pattern.source, pattern.flags)
  let match = regex.exec(text)

  while (match) {
    onMatch(match)
    match = regex.exec(text)
  }
}

/** Pull product names the agent mentioned in plain-text replies. */
export function extractProductNamesFromAgentText(text: string): string[] {
  const names: string[] = []
  const seen = new Set<string>()

  forEachRegexMatch(text, /\*\*([^*\n]+)\*\*/g, (match) => {
    addUniqueName(names, seen, match[1] ?? '')
  })

  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    const bullet = trimmed.match(/^[-•*]\s+(?:\*\*)?(.+?)(?:\*\*)?$/)
    if (bullet?.[1]) {
      addUniqueName(names, seen, bullet[1])
    }

    const numbered = trimmed.match(/^\d+[.)]\s+(?:\*\*)?(.+?)(?:\*\*)?$/)
    if (numbered?.[1]) {
      addUniqueName(names, seen, numbered[1])
    }
  }

  forEachRegexMatch(text, BRAND_PREFIX, (match) => {
    addUniqueName(names, seen, match[1] ?? '')
  })

  return names.slice(0, 6)
}

function userMessageBefore(thread: AgentChatMessage[], index: number): string | undefined {
  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    if (thread[cursor]?.direction === 'in') {
      return thread[cursor].text.trim() || undefined
    }
  }

  return undefined
}

function keywordFallbackFromAgentText(text: string): string | undefined {
  const cleaned = text
    .replace(/\*\*/g, '')
    .replace(/[^\w\s-]/g, ' ')
    .toLowerCase()

  const tokens = cleaned
    .split(/\s+/)
    .filter(
      (token) =>
        token.length > 3 &&
        ![
          'that',
          'this',
          'with',
          'your',
          'have',
          'from',
          'will',
          'would',
          'could',
          'should',
          'about',
          'build',
          'sense',
          'routine',
          'skincare',
          'products',
          'product',
          'recommend',
          'suggest',
          'great',
          'happy',
          'help',
        ].includes(token)
    )

  const phrase = tokens.slice(0, 6).join(' ').trim()

  return phrase || undefined
}

/** Search terms to hydrate a plain-text agent reply — one query per product name when possible. */
export function searchTermsForAgentMessage(
  thread: AgentChatMessage[],
  index: number
): string[] {
  const message = thread[index]

  if (message?.direction !== 'out' || message.products?.length) {
    return []
  }

  const fromAgent = extractProductNamesFromAgentText(message.text)

  if (fromAgent.length) {
    return fromAgent.slice(0, 4)
  }

  const user = userMessageBefore(thread, index)

  if (user) {
    return [user]
  }

  const keywords = keywordFallbackFromAgentText(message.text)

  return keywords ? [keywords] : []
}

export function searchTermForAgentMessage(
  thread: AgentChatMessage[],
  index: number
): string | undefined {
  return searchTermsForAgentMessage(thread, index)[0]
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

  return searchTermsForAgentMessage(thread, index).length > 0
}

export const SEARCH_SHELF_HEADER = 'Recommended for you'
