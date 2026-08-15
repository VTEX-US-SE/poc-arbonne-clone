export interface CountryOption {
  label: string
  active?: boolean
}

export interface LocaleRowProps {
  label: string
  /** Currently applied locale -- shows the check. */
  active?: boolean
  /** This row was picked and the redirect has not happened yet. */
  pending?: boolean
  /** Set on every row while any switch is in flight. */
  disabled?: boolean
  /** @default 'Switching…' */
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
