import { useMemo } from 'react'

import useAgentProductSearch from '../../../hooks/useAgentProductSearch'
import {
  SEARCH_SHELF_HEADER,
  searchTermsForAgentMessage,
  shouldEnrichWithSearch,
} from '../../../utils/agentProductSearch'
import MessageBubble from '../MessageBubble/MessageBubble'
import type { AgentChatMessage } from '../BeautyConsultant.types'
import type { EnrichedMessageBubbleProps } from './EnrichedMessageBubble.types'

export default function EnrichedMessageBubble({
  message,
  thread,
  index,
  enableSearchShelf,
}: EnrichedMessageBubbleProps) {
  const searchTerms =
    enableSearchShelf && shouldEnrichWithSearch(thread, index)
      ? searchTermsForAgentMessage(thread, index)
      : undefined

  const searchedProducts = useAgentProductSearch(searchTerms)

  const enriched = useMemo<AgentChatMessage>(() => {
    if (message.products?.length) {
      return message
    }

    if (!searchedProducts.length) {
      return message
    }

    return {
      ...message,
      header: message.header ?? SEARCH_SHELF_HEADER,
      products: searchedProducts,
    }
  }, [message, searchedProducts])

  return <MessageBubble message={enriched} />
}
