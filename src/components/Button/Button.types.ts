import type { AnchorHTMLAttributes } from 'react'

export interface ButtonProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'type'> {
  href: string
  variant?: 'primary' | 'secondary' | 'tertiary'
  size?: 'small' | 'regular'
}
