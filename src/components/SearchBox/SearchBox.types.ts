import type { ProductCardProduct } from '../ProductCard/ProductCard.types'

export interface SearchBoxProps {
  placeholder?: string
}

export interface SearchResultsSkeletonProps {
  terms?: number
  products?: number
}

export interface SearchProductRowProps {
  product: ProductCardProduct
  index: number
  onNavigate: () => void
}
