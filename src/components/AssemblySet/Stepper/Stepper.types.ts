export interface StepperProps {
  value: number
  decreaseLabel: string
  increaseLabel: string
  canDecrease?: boolean
  canIncrease?: boolean
  announce?: boolean
  onDecrease: () => void
  onIncrease: () => void
}
