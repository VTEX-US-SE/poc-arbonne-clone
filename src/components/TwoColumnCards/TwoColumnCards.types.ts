export interface Card {
  image?: string
  imageAlt?: string
  title?: string
  subtitle?: string
  description?: string
  link?: {
    url: string
    text: string
  }
}

export interface TwoColumnCardsProps {
  headline?: string
  text?: string
  textColor?: string
  cards?: Card[]
}
