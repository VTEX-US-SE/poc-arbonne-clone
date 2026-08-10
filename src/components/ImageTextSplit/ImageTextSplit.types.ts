export interface ImageTextSplitProps {
  image?: string
  imageAlt?: string
  imagePosition?: 'left' | 'right'
  textAlign?: 'start' | 'center'
  // Alternative to `image`: a colored circle with stacked text, e.g. "START
  // YOUR BUSINESS" (multi-line via \n). Takes precedence over `image` when set.
  badgeText?: string
  badgeBackgroundColor?: string
  badgeTextColor?: string
  eyebrow?: string
  headline?: string
  text?: string
  cta?: {
    url: string
    text: string
    backgroundColor?: string
    textColor?: string
  }
}
