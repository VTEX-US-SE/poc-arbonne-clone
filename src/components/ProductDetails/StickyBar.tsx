import PurchaseCta from '../PurchaseCta/PurchaseCta'
import Skeleton from '../Skeleton/Skeleton'
import styles from './ProductDetails.module.scss'
import type { StickyBarProps } from './ProductDetails.types'

/**
 * Compact price + add-to-cart floated once the real purchase options scroll
 * off the top. Always the one-time CTA -- the sticky bar is a shortcut, not a
 * second place to configure a subscription.
 */
export default function StickyBar({
  priceLabel,
  formattedPrice,
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
          <div className={styles.productDetails__price}>
            <Skeleton loading={loading} width="6rem" height="2.625rem">
              {formattedPrice}
            </Skeleton>
          </div>
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
