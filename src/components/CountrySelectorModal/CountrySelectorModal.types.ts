export interface CountryOption {
  label: string
  active?: boolean
}

export interface LocaleRowProps {
  label: string
  /**
   * Locale code for this row's flag, e.g. `fr-CA`. Omitted by the CMS fallback
   * rows, which have no binding behind them and so render without a flag.
   */
  locale?: string
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
