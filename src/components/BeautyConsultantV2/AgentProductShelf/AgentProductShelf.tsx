import { useMemo } from 'react'

import AgentProductCard from '../../BeautyConsultant/AgentProductCard/AgentProductCard'
import useAgentProductSearch from '../../../hooks/useAgentProductSearch'
import {
  SEARCH_SHELF_HEADER,
  searchTermForAgentMessage,
  shouldEnrichWithSearch,
} from '../../../utils/agentProductSearch'
import type { AgentChatMessage } from '../../BeautyConsultant/BeautyConsultant.types'
import styles from './AgentProductShelf.module.scss'
import type { AgentProductShelfProps } from './AgentProductShelf.types'

function enrichedMessage(
  message: AgentChatMessage,
  searchedProducts: AgentChatMessage['products']
): AgentChatMessage | null {
  if (message.products?.length) {
    return message
  }

  if (!searchedProducts?.length) {
    return null
  }

  return {
    ...message,
    header: message.header ?? SEARCH_SHELF_HEADER,
    products: searchedProducts,
  }
}

export default function AgentProductShelf({
  message,
  thread,
  index,
  enableSearchShelf,
  onAskAbout,
}: AgentProductShelfProps) {
  const searchTerm =
    enableSearchShelf && shouldEnrichWithSearch(thread, index)
      ? searchTermForAgentMessage(thread, index)
      : undefined

  const searchedProducts = useAgentProductSearch(searchTerm)

  const shelf = useMemo(
    () => enrichedMessage(message, searchedProducts),
    [message, searchedProducts]
  )

  if (!shelf?.products?.length) {
    return null
  }

  return (
    <section
      className={styles.agentProductShelf}
      aria-label={shelf.header ?? 'Recommended products'}
    >
      {shelf.header && (
        <h3 className={styles.agentProductShelf__header}>{shelf.header}</h3>
      )}
      <div className={styles.agentProductShelf__grid}>
        {shelf.products.map((product) => (
          <AgentProductCard
            key={`${product.sku}-${product.seller}`}
            product={product}
            variant="shelf"
            onAskAbout={onAskAbout}
          />
        ))}
      </div>
    </section>
  )
}
