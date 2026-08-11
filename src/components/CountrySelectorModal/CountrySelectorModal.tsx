import { Icon, Modal, ModalBody, ModalHeader } from '@faststore/ui'

import useLockBodyScroll from '../../hooks/useLockBodyScroll'
import styles from './CountrySelectorModal.module.scss'
import type { CountrySelectorModalProps } from './CountrySelectorModal.types'

/**
 * Visual-only mock of the country/language picker -- no real locale
 * switching wired up. `active` on an option just renders a checkmark;
 * clicking an option doesn't change anything yet.
 */
export default function CountrySelectorModal({
  open,
  onClose,
  title = 'Select Language',
  options = [],
  onSelect,
}: CountrySelectorModalProps) {
  useLockBodyScroll(open)

  if (!open) {
    return null
  }

  return (
    <Modal
      isOpen={open}
      onDismiss={onClose}
      className={styles.countrySelectorModal}
      aria-label={title}
    >
      <ModalHeader title={title} onClose={onClose} />
      <ModalBody>
        <ul className={styles.countrySelectorModal__list}>
          {options.map((option, index) => (
            <li
              key={option.label}
              className={styles.countrySelectorModal__item}
              data-active={option.active || undefined}
              onClick={() => onSelect?.(index)}
            >
              {option.flag && (
                <img
                  className={styles.countrySelectorModal__flag}
                  src={option.flag}
                  alt=""
                />
              )}
              <span className={styles.countrySelectorModal__label}>
                {option.label}
              </span>
              {option.active && (
                <Icon
                  className={styles.countrySelectorModal__check}
                  name="Checked"
                  width={16}
                  height={16}
                />
              )}
            </li>
          ))}
        </ul>
      </ModalBody>
    </Modal>
  )
}
