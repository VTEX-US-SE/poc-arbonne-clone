export interface ChatStatusProps {
  waiting: boolean
  error: string | null
  canRetry: boolean
  variant?: 'dark' | 'light'
  onRetry: () => void
}
