import AgentProductCard from '../AgentProductCard/AgentProductCard'
import styles from './MessageBubble.module.scss'
import type { MessageBubbleProps } from './MessageBubble.types'

export default function MessageBubble({ message }: MessageBubbleProps) {
  const fromAgent = message.direction === 'out'

  return (
    <div
      className={styles.messageBubble}
      data-direction={message.direction}
      aria-label={fromAgent ? 'Beauty Consultant' : 'You'}
    >
      {(message.header || message.text) && (
        <div className={styles.messageBubble__body}>
          {message.header && (
            <strong className={styles.messageBubble__header}>
              {message.header}
            </strong>
          )}
          {message.text && <p>{message.text}</p>}
        </div>
      )}

      {message.products && (
        <div
          className={styles.messageBubble__products}
          aria-label="Recommended products"
        >
          {message.products.map((product) => (
            <AgentProductCard
              key={`${product.sku}-${product.seller}`}
              product={product}
            />
          ))}
        </div>
      )}
    </div>
  )
}
