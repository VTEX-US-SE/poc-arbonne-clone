export interface LoginAccountCard {
  title: string
  subtitle?: string
  description?: string
  price?: string
  /** SKU this card's CTA adds before redirecting to checkout. */
  skuId?: string
  learnMoreUrl?: string
}

export interface LoginModalProps {
  open: boolean
  onClose?: () => void
  createAccountText?: string
  accountCards?: LoginAccountCard[]
}
