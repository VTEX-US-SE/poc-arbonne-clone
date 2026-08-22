import type { LinkButtonProps } from '@faststore/ui'

import type { ButtonColorScheme } from './Button.colorSchemes'

export interface ButtonProps extends Omit<LinkButtonProps, 'href'> {
  /** Renders an anchor when given, a real `<button>` when omitted. */
  href?: string
  colorScheme?: ButtonColorScheme
}
