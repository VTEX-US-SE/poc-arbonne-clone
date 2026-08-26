import { usePriceFormatter } from 'src/sdk/product/useFormattedPrice'

import Skeleton from '../Skeleton/Skeleton'
import styles from './Price.module.scss'
import type { PriceProps } from './Price.types'

// ponytail: hardcoded until the layout is signed off, then promote to CMS
// fields -- three locales mean these labels cannot stay English-only.
const SRP_LABEL = 'SRP'
const PC_PRICE_LABEL = 'PC Price'

/**
 * The prod price block: selling price with the struck-through SRP beside it and
 * the Preferred Client price below. Mirrors the non-migrated site, where a
 * guest and a PC session both see the PC figure.
 *
 * Every tier is a real number -- `price`/`listPrice` from the offer, `pcPrice`
 * from the `preferredclient` price table -- never derived from a ratio. The
 * `preferredclient` promo does not always match the retail promo, so a computed
 * PC price would be wrong on exactly the SKUs that carry their own PC discount.
 *
 * The SRP is shown only when it is genuinely above the selling price: with no
 * promo the two are equal, and a struck line reading the same number is noise.
 * The selling price turns sale-red in that same case.
 */
export default function Price({
  price,
  listPrice = 0,
  pcPrice,
  variant = 'detail',
  loading,
  className,
}: PriceProps) {
  const formatPrice = usePriceFormatter({ decimals: true })
  const rootClassName = [styles.price, className].filter(Boolean).join(' ')

  if (loading) {
    return (
      <div className={rootClassName} data-variant={variant}>
        <Skeleton width="8rem" height="2.625rem" />
      </div>
    )
  }

  const onSale = listPrice > price

  return (
    <div className={rootClassName} data-variant={variant}>
      <div className={styles.price__row}>
        <span className={styles.price__selling}>{formatPrice(price)}</span>
        {onSale && (
          <span className={styles.price__srp}>
            {formatPrice(listPrice)} {SRP_LABEL}
          </span>
        )}
      </div>

      {pcPrice != null && (
        <p className={styles.price__pc}>
          {formatPrice(pcPrice)} {PC_PRICE_LABEL}
        </p>
      )}
    </div>
  )
}
