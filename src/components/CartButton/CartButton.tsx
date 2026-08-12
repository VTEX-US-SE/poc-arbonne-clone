import { Icon } from '@faststore/ui'
import {
  useCartToggleButton_unstable as useCartToggleButton,
  // @ts-ignore next-line
} from '@faststore/core/experimental'

import styles from './CartButton.module.scss'

/**
 * Bag icon badged with the cart's item count, toggling the cart sidebar.
 * Count and click handler both come from core's `useCartToggleButton`, so
 * the badge tracks the same total the sidebar shows.
 */
export default function CartButton() {
  const { 'data-items': totalItems, ...toggleProps } = useCartToggleButton()

  return (
    <button
      type="button"
      className={styles.cartButton}
      aria-label={`Cart with ${totalItems} items`}
      {...toggleProps}
    >
      <Icon name="Bag" width={24} height={24} />
      {totalItems > 0 && (
        <span className={styles.cartButton__count}>{totalItems}</span>
      )}
    </button>
  )
}
