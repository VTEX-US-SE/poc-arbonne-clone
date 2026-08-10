import type { CSSProperties } from 'react'
import { LinkButton } from '@faststore/ui'

import { BUTTON_COLOR_SCHEMES } from './Button.colorSchemes'
import styles from './Button.module.scss'
import type { ButtonProps } from './Button.types'

/**
 * Brand CTA button. Wraps `@faststore/ui`'s `LinkButton`, applying colors,
 * padding, font, letter-spacing, and height from a named `colorScheme`
 * (see `Button.colorSchemes.ts`) instead of accepting raw style props.
 */
export default function Button({
  variant = 'primary',
  size = 'regular',
  className,
  colorScheme = 'white',
  children,
  style,
  ...otherProps
}: ButtonProps) {
  const scheme = BUTTON_COLOR_SCHEMES[colorScheme]
  const borderColor = 'borderColor' in scheme ? scheme.borderColor : undefined
  const borderWidth = 'borderWidth' in scheme ? scheme.borderWidth : undefined
  const hoverBackgroundColor =
    'hoverBackgroundColor' in scheme ? scheme.hoverBackgroundColor : undefined
  const hoverTextColor =
    'hoverTextColor' in scheme ? scheme.hoverTextColor : undefined

  return (
    <LinkButton
      variant={variant}
      size={size}
      className={[styles.button, className].filter(Boolean).join(' ')}
      data-color-scheme={colorScheme}
      style={
        {
          '--fs-button-primary-bkg-color': scheme.backgroundColor,
          '--fs-button-primary-bkg-color-hover':
            hoverBackgroundColor ?? scheme.backgroundColor,
          '--fs-button-primary-text-color': scheme.textColor,
          '--fs-button-primary-text-color-hover': hoverTextColor,
          '--fs-button-primary-border-color': borderColor,
          '--fs-button-primary-border-color-hover': hoverBackgroundColor,
          '--fs-button-border-width': borderWidth,
          '--fs-button-padding': scheme.padding,
          '--fs-button-height': scheme.height,
          fontFamily: scheme.fontFamily,
          ...style,
        } as CSSProperties
      }
      {...otherProps}
    >
      <span
        style={{
          letterSpacing: scheme.letterSpacing,
          marginRight: `-${scheme.letterSpacing}`,
        }}
      >
        {children}
      </span>
    </LinkButton>
  )
}
