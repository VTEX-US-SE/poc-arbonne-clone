import { BuyButton, QuantitySelector, Select } from '@faststore/ui'

import styles from './PurchaseCta.module.scss'
import type { PurchaseCtaProps } from './PurchaseCta.types'

/**
 * Quantity, optional delivery frequency and the add-to-cart button. Shared by
 * every purchase surface so the labels are written in one place; the
 * consuming component passes its own root class to own the row's layout.
 */
export default function PurchaseCta({
  buyProps,
  disabled,
  onQuantityChange,
  quantityLabel = 'Quantity',
  buttonLabel = 'Add to Cart',
  frequencies,
  frequency,
  onFrequencyChange,
  className,
}: PurchaseCtaProps) {
  return (
    <div className={[styles.purchaseCta, className].filter(Boolean).join(' ')}>
      <div>
        <span className={styles.purchaseCta__quantityLabel}>
          {quantityLabel}
        </span>
        <QuantitySelector
          min={1}
          initial={1}
          disabled={disabled}
          onChange={onQuantityChange}
        />
      </div>

      {frequencies && (
        <div className={styles.purchaseCta__frequency}>
          <Select
            id="replenish-frequency"
            options={frequencies}
            value={frequency}
            onChange={(event) => onFrequencyChange?.(event.target.value)}
            aria-label="Delivery frequency"
          />
        </div>
      )}

      <BuyButton
        {...buyProps}
        variant="primary"
        className={styles.purchaseCta__buy}
        disabled={disabled}
      >
        {buttonLabel}
      </BuyButton>
    </div>
  )
}
