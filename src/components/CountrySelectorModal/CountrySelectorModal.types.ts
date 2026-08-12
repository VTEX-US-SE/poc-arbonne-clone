export interface CountryOption {
  label: string
  active?: boolean
}

export interface CountrySelectorModalProps {
  open: boolean
  onClose?: () => void
  title?: string
  options?: CountryOption[]
  onSelect?: (index: number) => void
}
