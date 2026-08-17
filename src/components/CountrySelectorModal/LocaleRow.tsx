import { Icon } from '@faststore/ui'

import LocaleFlag from '../LocaleFlag/LocaleFlag'
import styles from './CountrySelectorModal.module.scss'
import type { LocaleRowProps } from './CountrySelectorModal.types'

/**
 * One selectable language. The row is a real `button` rather than a clickable
 * `li`: it looked operable but could not be reached or activated by keyboard
 * at all, and a button brings focus, Enter/Space and the disabled state with
 * it instead of reimplementing each.
 */
export default function LocaleRow({
  label,
  locale,
  active,
  pending,
  disabled,
  pendingLabel = 'Switching…',
  onSelect,
}: LocaleRowProps) {
  return (
    <li
      className={styles.countrySelectorModal__item}
      data-active={active || undefined}
    >
      <button
        type="button"
        className={styles.countrySelectorModal__button}
        disabled={disabled}
        onClick={onSelect}
      >
        <LocaleFlag locale={locale} />
        <span className={styles.countrySelectorModal__label}>{label}</span>

        {pending ? (
          <span className={styles.countrySelectorModal__pending}>
            {pendingLabel}
          </span>
        ) : (
          active && (
            <Icon
              className={styles.countrySelectorModal__check}
              name="Checked"
              width={16}
              height={16}
            />
          )
        )}
      </button>
    </li>
  )
}
