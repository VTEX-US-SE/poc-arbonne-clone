export interface ChatInputProps {
  value: string
  placeholder: string
  disabled?: boolean
  variant?: 'dark' | 'light'
  onChange: (value: string) => void
  onSubmit: () => void
}
