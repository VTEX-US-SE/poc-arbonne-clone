export interface CountryOption {
  label: string
  flag?: string
  active?: boolean
}

export interface CountrySelectorModalProps {
  open: boolean
  onClose?: () => void
  title?: string
  options?: CountryOption[]
}
