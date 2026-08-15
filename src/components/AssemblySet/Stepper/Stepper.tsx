import styles from './Stepper.module.scss'
import type { StepperProps } from './Stepper.types'

/**
 * Minus / value / plus control. Shared by the item cards and the summary's
 * set quantity -- they had identical markup and styling, which only became
 * obvious once each component owned its own stylesheet.
 *
 * The two sides are separate callbacks rather than one `onChange(next)`:
 * each caller clamps differently (an item against its group's remaining
 * capacity, the set count against a floor of 1).
 */
export default function Stepper({
  value,
  decreaseLabel,
  increaseLabel,
  canDecrease = true,
  canIncrease = true,
  announce,
  onDecrease,
  onIncrease,
}: StepperProps) {
  return (
    <div className={styles.stepper}>
      <button
        type="button"
        className={styles.stepper__button}
        onClick={onDecrease}
        disabled={!canDecrease}
        aria-label={decreaseLabel}
      >
        &minus;
      </button>

      <span
        className={styles.stepper__value}
        aria-live={announce ? 'polite' : undefined}
      >
        {value}
      </span>

      <button
        type="button"
        className={styles.stepper__button}
        onClick={onIncrease}
        disabled={!canIncrease}
        aria-label={increaseLabel}
      >
        +
      </button>
    </div>
  )
}
