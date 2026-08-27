import { Icon } from '@faststore/ui'

import CameraIcon from './CameraIcon'
import styles from './ChatInput.module.scss'
import type { ChatInputProps } from './ChatInput.types'

export default function ChatInput({
  value,
  placeholder,
  disabled = false,
  variant = 'dark',
  onChange,
  onSubmit,
}: ChatInputProps) {
  return (
    <form
      className={[
        styles.chatInput,
        variant === 'light' && styles['chatInput--light'],
      ]
        .filter(Boolean)
        .join(' ')}
      role="search"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <Icon name="MagnifyingGlass" width={22} height={22} />
      <button
        className={styles.chatInput__camera}
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        disabled={disabled}
      >
        <CameraIcon width={22} height={22} />
      </button>
      <input
        className={styles.chatInput__field}
        type="text"
        value={value}
        maxLength={2_000}
        placeholder={placeholder}
        aria-label={placeholder}
        enterKeyHint="search"
        autoComplete="off"
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
      <button
        className={styles.chatInput__submit}
        type="submit"
        aria-label="Send message"
        disabled={disabled || !value.trim()}
      >
        <Icon name="ArrowRight" width={20} height={20} />
      </button>
    </form>
  )
}
