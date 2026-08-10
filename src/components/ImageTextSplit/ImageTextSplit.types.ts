export interface ImageTextSplitProps {
  image?: string
  imageAlt?: string
  imagePosition?: 'left' | 'right'
  textAlign?: 'start' | 'center'
  eyebrow?: string
  headline?: string
  text?: string
  cta?: {
    url: string
    text: string
  }
}
