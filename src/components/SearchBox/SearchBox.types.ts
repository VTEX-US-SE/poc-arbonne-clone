import type { ProductCardProduct } from '../ProductCard/ProductCard.types'

export interface SearchBoxProps {
  /** @default 'Find what you're looking for...' */
  placeholder?: string
}

export interface SearchProductRowProps {
  product: ProductCardProduct
  /**
   * Position in the suggestion list, reported in the product-click analytics
   * event.
   */
  index: number
  /** Closes the dropdown once the row navigates away. */
  onNavigate: () => void
}
