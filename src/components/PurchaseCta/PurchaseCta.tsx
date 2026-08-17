import { BuyButton, QuantitySelector, Select } from '@faststore/ui'

import Button from '../Button/Button'
import Skeleton from '../Skeleton/Skeleton'
import styles from './PurchaseCta.module.scss'
import type { PurchaseCtaProps } from './PurchaseCta.types'

/**
 * Quantity, optional delivery frequency and the add-to-cart button. Shared by
 * every purchase surface so the labels are written in one place; the
 * consuming component passes its own root class to own the row's layout.
 *
 * Every add-to-cart in this project routes through here, so `loading` is
 * handled once rather than at each of the three call sites.
 *
 * With `href` set the button becomes a link instead -- customisable sets keep
 * this exact row but send the shopper to the set builder, since their parent SKU
 * is priced at zero and cannot be added to the cart directly.
 */
export default function PurchaseCta({
  buyProps,
  disabled,
  loading,
  quantity = 1,
  onQuantityChange,
  quantityLabel = 'Quantity',
  buttonLabel = 'Add to Cart',
  frequencies,
  frequency,
  onFrequencyChange,
  className,
  href,
}: PurchaseCtaProps) {
  const rootClassName = [styles.purchaseCta, className]
    .filter(Boolean)
    .join(' ')

  if (loading) {
    return (
      <div className={rootClassName}>
        <div>
          <span className={styles.purchaseCta__quantityLabel}>
            {quantityLabel}
          </span>
          <Skeleton width="6.25rem" height="3.125rem" />
        </div>

        {frequencies && (
          <div className={styles.purchaseCta__frequency}>
            <Skeleton width="9rem" height="3.125rem" />
          </div>
        )}

        <Skeleton width="10rem" height="3rem" />
      </div>
    )
  }

  return (
    <div className={rootClassName}>
      <div>
        <span className={styles.purchaseCta__quantityLabel}>
          {quantityLabel}
        </span>
        <QuantitySelector
          min={1}
          initial={quantity}
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

      {href ? (
        <Button
          className={styles.purchaseCta__buy}
          href={href}
          colorScheme="green"
        >
          {buttonLabel}
        </Button>
      ) : (
        <BuyButton
          {...buyProps}
          variant="primary"
          className={styles.purchaseCta__buy}
          disabled={disabled}
        >
          {buttonLabel}
        </BuyButton>
      )}
    </div>
  )
}
