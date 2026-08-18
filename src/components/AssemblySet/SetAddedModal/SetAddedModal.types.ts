export interface SetAddedModalProps {
  open: boolean
  /** Parent set's name, e.g. "Build Your Best Nutrition Set". */
  setName?: string
  /** Copies added, so the copy can say "3 sets added". */
  sets: number
  /** Chosen children, for the summary list. */
  lines: Array<{ name: string; quantity: number }>
  /** Cart total from the orderForm, already formatted. */
  formattedTotal?: string
  /** Any message Checkout returned, e.g. a quantity limit warning. */
  notice?: string
  onKeepCustomizing: () => void
  onCheckout: () => void
}
