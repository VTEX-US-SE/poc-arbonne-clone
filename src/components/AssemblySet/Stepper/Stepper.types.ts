export interface StepperProps {
  value: number
  /** Accessible name for the decrement control, e.g. `Remove one Fizz Stick`. */
  decreaseLabel: string
  /** Accessible name for the increment control. */
  increaseLabel: string
  canDecrease?: boolean
  canIncrease?: boolean
  /**
   * Announce the value as it changes. Set where the number is the only
   * feedback for the action; leave off where a surrounding live region
   * already reports the total.
   */
  announce?: boolean
  onDecrease: () => void
  onIncrease: () => void
}
