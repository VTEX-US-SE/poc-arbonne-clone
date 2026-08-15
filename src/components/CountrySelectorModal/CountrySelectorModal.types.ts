export interface CountryOption {
  label: string
  active?: boolean
}

export interface LocaleRowProps {
  label: string
  active?: boolean
  pending?: boolean
  disabled?: boolean
  pendingLabel?: string
  onSelect: () => void
}

export interface CountrySelectorModalProps {
  open: boolean
  onClose?: () => void
  title?: string
  options?: CountryOption[]
  onSelect?: (index: number) => void
}
