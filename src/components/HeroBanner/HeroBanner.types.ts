import type { ButtonColorScheme } from '../Button/Button.colorSchemes'

export interface HeroBannerProps {
  desktopImage?: string
  mobileImage?: string
  imageAlt?: string
  priority?: boolean
  backgroundColor?: string
  textColor?: string
  contentPosition?: 'left' | 'center' | 'right'
  eyebrow?: string
  headline?: string
  subheadline?: string
  text?: string
  cta?: {
    url: string
    text: string
    colorScheme?: ButtonColorScheme
  }
}
