import Price from '../Price/Price'
import PurchaseCta from '../PurchaseCta/PurchaseCta'
import styles from './ProductDetails.module.scss'
import type { StickyBarProps } from './ProductDetails.types'

/**
 * Compact price + add-to-cart floated once the real purchase options scroll
 * off the top. Always the one-time CTA -- the sticky bar is a shortcut, not a
 * second place to configure a subscription.
 *
 * Reuses `Price` for the same struck-SRP treatment as the main block, minus the
 * PC line to keep the bar compact.
 */
export default function StickyBar({
  priceLabel,
  price,
  listPrice,
  quantityLabel,
  buttonLabel,
  buyProps,
  disabled,
  loading,
  quantity,
  onQuantityChange,
  ctaHref,
}: StickyBarProps) {
  return (
    <div className={styles.productDetails__stickyBar}>
      <div className={styles.productDetails__stickyBarInner}>
        <div className={styles.productDetails__stickyBarPrice}>
          <span className={styles.productDetails__priceLabel}>
            {priceLabel}
          </span>
          {price !== undefined && (
            <Price
              className={styles.productDetails__stickyBarPriceValue}
              variant="detail"
              price={price}
              listPrice={listPrice}
              pcPrice={null}
              loading={loading}
            />
          )}
        </div>

        <PurchaseCta
          quantityLabel={quantityLabel}
          buttonLabel={buttonLabel}
          buyProps={buyProps}
          disabled={disabled}
          loading={loading}
          quantity={quantity}
          onQuantityChange={onQuantityChange}
          href={ctaHref}
        />
      </div>
    </div>
  )
}
