import { LinkButton } from '@faststore/ui'

import styles from './Button.module.scss'
import type { ButtonProps } from './Button.types'

export default function Button({
  variant = 'primary',
  size = 'regular',
  className,
  children,
  ...otherProps
}: ButtonProps) {
  return (
    <LinkButton
      variant={variant}
      size={size}
      className={[styles.button, className].filter(Boolean).join(' ')}
      {...otherProps}
    >
      {children}
    </LinkButton>
  )
}
