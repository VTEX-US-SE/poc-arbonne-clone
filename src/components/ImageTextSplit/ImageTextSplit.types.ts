import type { ButtonColorScheme } from '../Button/Button.colorSchemes'

export interface ImageTextSplitProps {
  image?: string
  imageAlt?: string
  imagePosition?: 'left' | 'right'
  textAlign?: 'start' | 'center'
  eyebrow?: string
  headline?: string
  text?: string
  // Rendered on its own line below `text`, e.g. "EARNINGS.ARBONNE.COM." --
  // separate from `cta`, which is the button below it.
  link?: {
    url: string
    text: string
  }
  cta?: {
    url: string
    text: string
    colorScheme?: ButtonColorScheme
  }
}
