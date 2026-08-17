export interface PurchaseCtaFrequency {
  value: string
  label: string
}

export interface PurchaseCtaProps {
  buyProps: Record<string, unknown>
  disabled?: boolean
  quantity?: number
  loading?: boolean
  onQuantityChange: (value: number) => void
  quantityLabel?: string
  buttonLabel?: string
  /**
   * Renders the CTA as a link to this href rather than an add-to-cart button.
   * Same appearance either way -- `Button`'s `green` scheme matches the buy
   * button's own styling.
   */
  href?: string
  frequencies?: Record<string, string>
  frequency?: string
  onFrequencyChange?: (value: string) => void
  className?: string
}
