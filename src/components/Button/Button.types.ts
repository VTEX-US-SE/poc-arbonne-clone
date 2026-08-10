import type { LinkButtonProps } from '@faststore/ui'

import type { ButtonColorScheme } from './Button.colorSchemes'

export interface ButtonProps extends LinkButtonProps {
  href: string
  colorScheme?: ButtonColorScheme
  // Applied to the label only (not the button box), with a matching
  // negative margin so the trailing space letter-spacing adds after the
  // last character doesn't visually uncenter the label within the pill.
  letterSpacing?: string
}
