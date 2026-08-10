import type { ButtonColorScheme } from '../Button/Button.colorSchemes'

export interface ImageTextSplitProps {
  image?: string
  imageAlt?: string
  imagePosition?: 'left' | 'right'
  textAlign?: 'start' | 'center'
  eyebrow?: string
  headline?: string
  text?: string
  // Inline link rendered after `text`, e.g. "For typical results:
  // EARNINGS.ARBONNE.COM." -- separate from `cta`, which is the button below it.
  inlineLink?: {
    url: string
    text: string
  }
  cta?: {
    url: string
    text: string
    colorScheme?: ButtonColorScheme
  }
}
