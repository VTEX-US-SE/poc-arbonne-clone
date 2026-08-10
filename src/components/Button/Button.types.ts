import type { AnchorHTMLAttributes } from 'react'

export interface ButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  variant?: 'primary' | 'secondary' | 'tertiary'
  size?: 'small' | 'regular'
}
