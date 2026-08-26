import AgentProductCard from '../AgentProductCard/AgentProductCard'
import styles from './MessageBubble.module.scss'
import type { MessageBubbleProps } from './MessageBubble.types'

export default function MessageBubble({ message }: MessageBubbleProps) {
  const fromAgent = message.direction === 'out'
  const hasProducts = Boolean(message.products?.length)
  const shelfHeader = message.header

  return (
    <div
      className={styles.messageBubble}
      data-direction={message.direction}
      data-has-products={hasProducts || undefined}
      aria-label={fromAgent ? 'Beauty Consultant' : 'You'}
    >
      {(message.header || message.text) && (
        <div className={styles.messageBubble__body}>
          {message.header && !hasProducts && (
            <strong className={styles.messageBubble__header}>
              {message.header}
            </strong>
          )}
          {message.text && <p>{message.text}</p>}
        </div>
      )}

      {hasProducts && (
        <div
          className={styles.messageBubble__shelf}
          aria-label="Recommended products"
        >
          {shelfHeader && (
            <p className={styles.messageBubble__shelfHeader}>{shelfHeader}</p>
          )}
          <div className={styles.messageBubble__products}>
            {message.products?.map((product) => (
              <AgentProductCard
                key={`${product.sku}-${product.seller}`}
                product={product}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
