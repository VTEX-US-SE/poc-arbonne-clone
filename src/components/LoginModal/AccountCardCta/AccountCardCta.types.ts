export interface AccountCardCtaProps {
  /** SKU this CTA adds to the cart. */
  skuId: string
  label?: string
  className?: string
  /** Called once the item is in the cart, to dismiss the modal behind the drawer. */
  onAdded?: () => void
  /**
   * Every account-type SKU on offer. Adding one drops the others -- they are
   * alternatives, not a basket.
   */
  exclusiveSkus?: string[]
}
