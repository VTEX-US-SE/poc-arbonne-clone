export interface LoginAccountCard {
  title: string
  subtitle?: string
  description?: string
  price?: string
  addToCartUrl?: string
  learnMoreUrl?: string
}

export interface LoginModalProps {
  open: boolean
  onClose?: () => void
  loginUrl?: string
  otpLoginUrl?: string
  createAccountText?: string
  accountCards?: LoginAccountCard[]
}
