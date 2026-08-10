import type { ButtonColorScheme } from '../Button/Button.colorSchemes'

export interface ImageTextSplitProps {
  image?: string
  imageAlt?: string
  imagePosition?: 'left' | 'right'
  textAlign?: 'start' | 'center'
  eyebrow?: string
  headline?: string
  text?: string
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
