import styles from './ConversationBubble.module.scss'
import type { ConversationBubbleProps } from './ConversationBubble.types'

export default function ConversationBubble({ message }: ConversationBubbleProps) {
  if (!message.text.trim()) {
    return null
  }

  return (
    <div
      className={styles.conversationBubble}
      data-direction={message.direction}
      aria-label={message.direction === 'out' ? 'Beauty Consultant' : 'You'}
    >
      <div className={styles.conversationBubble__body}>
        <p>{message.text}</p>
      </div>
    </div>
  )
}
