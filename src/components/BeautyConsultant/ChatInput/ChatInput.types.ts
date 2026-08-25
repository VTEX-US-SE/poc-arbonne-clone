export interface ChatInputProps {
  value: string
  placeholder: string
  disabled?: boolean
  onChange: (value: string) => void
  onSubmit: () => void
}
