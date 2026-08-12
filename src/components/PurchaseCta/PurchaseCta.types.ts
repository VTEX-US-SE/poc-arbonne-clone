export interface PurchaseCtaFrequency {
  value: string
  label: string
}

export interface PurchaseCtaProps {
  buyProps: Record<string, unknown>
  disabled?: boolean
  onQuantityChange: (value: number) => void
  /**
   * Labels default here rather than in each consumer's CMS schema, so the
   * wording is defined once across every purchase surface.
   */
  quantityLabel?: string
  buttonLabel?: string
  /**
   * Delivery frequency choices. Omitted for a one-time purchase, which has
   * no schedule.
   */
  frequencies?: Record<string, string>
  frequency?: string
  onFrequencyChange?: (value: string) => void
  /**
   * Root class from the consuming component, which owns the row's layout.
   */
  className?: string
}
