import { Modal } from '@faststore/ui'

import useLockBodyScroll from '../../hooks/useLockBodyScroll'
import type { BaseModalProps } from './BaseModal.types'

/**
 * Shell every modal in this project renders through. Owns the body scroll
 * lock and returns `null` while closed -- `@faststore/ui`'s `Modal` measures
 * its position on mount, so a closed instance left mounted reopens
 * off-centre. Keeping that unmount here means a new modal cannot forget it.
 */
export default function BaseModal({
  open,
  onClose,
  className,
  ariaLabel,
  children,
}: BaseModalProps) {
  useLockBodyScroll(open)

  if (!open) {
    return null
  }

  return (
    <Modal
      isOpen={open}
      onDismiss={onClose}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </Modal>
  )
}
