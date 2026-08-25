import { Icon } from '@faststore/ui'

import styles from './ChatInput.module.scss'
import type { ChatInputProps } from './ChatInput.types'

export default function ChatInput({
  value,
  placeholder,
  disabled = false,
  onChange,
  onSubmit,
}: ChatInputProps) {
  return (
    <form
      className={styles.chatInput}
      role="search"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <Icon name="MagnifyingGlass" width={22} height={22} />
      <input
        className={styles.chatInput__field}
        type="search"
        value={value}
        maxLength={2_000}
        placeholder={placeholder}
        aria-label={placeholder}
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
