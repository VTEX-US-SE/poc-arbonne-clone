import type { ReactNode } from 'react'

export interface BaseModalProps {
  open: boolean
  onClose: () => void
  /**
   * Root class for the modal surface, owned by the calling modal.
   */
  className?: string
  ariaLabel: string
  children: ReactNode
}
