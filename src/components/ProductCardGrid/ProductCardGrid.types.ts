export interface ProductCard {
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

export interface ProductCardGridProps {
  cards?: ProductCard[]
}
