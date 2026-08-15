export interface PurchaseCtaFrequency {
  value: string
  label: string
}

export interface PurchaseCtaProps {
  buyProps: Record<string, unknown>
  disabled?: boolean
  /**
   * Current quantity, owned by the consumer. `QuantitySelector` is
   * uncontrolled and seeds itself from this on mount, so a surface that
   * mounts later (the sticky bar, the other purchase option) must be handed
   * the live value or it displays 1 while the cart receives something else.
   */
  quantity?: number
  /**
   * Draws the controls as placeholders. Set while the offer is revalidating:
   * the price and stock behind `buyProps` are still the server's, so the row
   * must not accept a click until the client copy lands.
   */
  loading?: boolean
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
