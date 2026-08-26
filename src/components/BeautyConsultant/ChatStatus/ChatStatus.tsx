import styles from './ChatStatus.module.scss'
import type { ChatStatusProps } from './ChatStatus.types'

export default function ChatStatus({
  waiting,
  error,
  canRetry,
  variant = 'dark',
  onRetry,
}: ChatStatusProps) {
  if (error) {
    return (
      <div
        className={[
          styles.chatStatus,
          variant === 'light' && styles['chatStatus--light'],
        ]
          .filter(Boolean)
          .join(' ')}
        role="alert"
        data-error
      >
        <span>{error}</span>
        {canRetry && (
          <button type="button" onClick={onRetry}>
            Try again
          </button>
        )}
      </div>
    )
  }

  return waiting ? (
    <div
      className={[
        styles.chatStatus,
        variant === 'light' && styles['chatStatus--light'],
      ]
        .filter(Boolean)
        .join(' ')}
      role="status"
    >
      <span className={styles.chatStatus__dots} aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span>Beauty Consultant is thinking…</span>
    </div>
  ) : null
}
