import type { LinkButtonProps } from '@faststore/ui'

import type { ButtonColorScheme } from './Button.colorSchemes'

export interface ButtonProps extends LinkButtonProps {
  href: string
  colorScheme?: ButtonColorScheme
}
