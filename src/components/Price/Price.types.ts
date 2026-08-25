export interface PriceProps {
  /** Selling price the shopper actually pays, after promotions. */
  price: number
  /** Suggested retail (SRP). Rendered struck-through only when above `price`. */
  listPrice?: number
  /**
   * Preferred Client price, from the account's `preferredclient` price table
   * via the `pcPrice` API field. Already suppressed server-side when it is not
   * below `price`, so the PC line only appears when it is a genuine saving.
   */
  pcPrice?: number | null
  /**
   * Typography scale. `detail` is the PDP buy box, `card` a shelf tile.
   */
  variant?: 'detail' | 'card'
  loading?: boolean
  /** Layout (margin, padding) belongs to the consuming surface. */
  className?: string
}
