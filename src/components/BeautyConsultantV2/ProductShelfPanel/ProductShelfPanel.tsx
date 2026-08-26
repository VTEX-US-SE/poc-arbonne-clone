import {
  shouldEnrichWithSearch,
} from '../../../utils/agentProductSearch'
import AgentProductShelf from '../AgentProductShelf/AgentProductShelf'
import styles from './ProductShelfPanel.module.scss'
import type { ProductShelfPanelProps } from './ProductShelfPanel.types'

function hasEmbeddedProducts(
  thread: ProductShelfPanelProps['thread']
): boolean {
  return thread.some(
    (message) => message.direction === 'out' && Boolean(message.products?.length)
  )
}

function canEnrichFromSearch(
  thread: ProductShelfPanelProps['thread']
): boolean {
  for (let index = thread.length - 1; index >= 0; index -= 1) {
    if (thread[index]?.direction === 'out') {
      return shouldEnrichWithSearch(thread, index)
    }
  }

  return false
}

export default function ProductShelfPanel({
  thread,
  enableSearchShelf,
  emptyLabel,
  waiting,
  onAskAbout,
}: ProductShelfPanelProps) {
  const agentTurns = thread
    .map((message, index) => ({ message, index }))
    .filter(({ message }) => message.direction === 'out' && message.id !== 'welcome')

  const showPlaceholder =
    !hasEmbeddedProducts(thread) &&
    !canEnrichFromSearch(thread) &&
    !waiting &&
    agentTurns.length > 0

  return (
    <aside className={styles.productShelfPanel} aria-label="Product recommendations">
      <h2 className={styles.productShelfPanel__title}>Recommended for you</h2>
      <div className={styles.productShelfPanel__scroll}>
        {agentTurns.map(({ message, index }) => (
          <AgentProductShelf
            key={message.id}
            message={message}
            thread={thread}
            index={index}
            enableSearchShelf={enableSearchShelf}
            onAskAbout={onAskAbout}
          />
        ))}
        {showPlaceholder && (
          <p className={styles.productShelfPanel__empty}>{emptyLabel}</p>
        )}
        {waiting && !hasEmbeddedProducts(thread) && (
          <p className={styles.productShelfPanel__empty}>
            Finding products for you…
          </p>
        )}
      </div>
    </aside>
  )
}
