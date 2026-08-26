import { useMemo } from 'react'

import useAgentProductSearch from '../../../hooks/useAgentProductSearch'
import {
  SEARCH_SHELF_HEADER,
  searchTermForAgentMessage,
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
  const searchTerm =
    enableSearchShelf && shouldEnrichWithSearch(thread, index)
      ? searchTermForAgentMessage(thread, index)
      : undefined

  const searchedProducts = useAgentProductSearch(searchTerm)

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
