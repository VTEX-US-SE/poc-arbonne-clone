export interface PurchaseCtaFrequency {
  value: string
  label: string
}

export interface PurchaseCtaProps {
  buyProps: Record<string, unknown>
  disabled?: boolean
  quantity?: number
  loading?: boolean
  onQuantityChange: (value: number) => void
  quantityLabel?: string
  buttonLabel?: string
  frequencies?: Record<string, string>
  frequency?: string
  onFrequencyChange?: (value: string) => void
  className?: string
}
