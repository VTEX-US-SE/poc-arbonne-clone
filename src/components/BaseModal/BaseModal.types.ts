import type { ReactNode } from 'react'

export interface BaseModalProps {
  open: boolean
  onClose?: () => void
  className?: string
  ariaLabel: string
  children: ReactNode
}
