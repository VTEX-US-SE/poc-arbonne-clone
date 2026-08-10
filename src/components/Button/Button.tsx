import type { CSSProperties } from 'react'
import { LinkButton } from '@faststore/ui'

import { BUTTON_COLOR_SCHEMES } from './Button.colorSchemes'
import styles from './Button.module.scss'
import type { ButtonProps } from './Button.types'

export default function Button({
  variant = 'primary',
  size = 'regular',
  className,
  colorScheme = 'white',
  letterSpacing,
  children,
  style,
  ...otherProps
}: ButtonProps) {
  const scheme = BUTTON_COLOR_SCHEMES[colorScheme]

  return (
    <LinkButton
      variant={variant}
      size={size}
      className={[styles.button, className].filter(Boolean).join(' ')}
      style={
        {
          '--fs-button-primary-bkg-color': scheme.backgroundColor,
          '--fs-button-primary-bkg-color-hover': scheme.hoverBackgroundColor,
          '--fs-button-primary-text-color': scheme.textColor,
          ...style,
        } as CSSProperties
      }
      {...otherProps}
    >
      {letterSpacing ? (
        <span style={{ letterSpacing, marginRight: `-${letterSpacing}` }}>
          {children}
        </span>
      ) : (
        children
      )}
    </LinkButton>
  )
}
