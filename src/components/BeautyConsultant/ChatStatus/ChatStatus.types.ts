export interface ChatStatusProps {
  waiting: boolean
  error: string | null
  canRetry: boolean
  onRetry: () => void
}
