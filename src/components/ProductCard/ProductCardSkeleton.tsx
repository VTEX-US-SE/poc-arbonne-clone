import Skeleton from '../Skeleton/Skeleton'

import styles from './ProductCard.module.scss'

/**
 * Placeholder occupying the same box as a `ProductCard`, reusing that card's
 * own classes so a grid keeps its height and column widths while it fetches.
 * The cart block is included because it is only collapsed above 1024px --
 * leaving it out would make mobile cards shorter than the real ones.
 *
 * Every element is a `div`: `Skeleton` renders a block, which is invalid
 * inside the `p`/`span` the real card uses.
 */
export default function ProductCardSkeleton() {
  return (
    <div className={styles.productCard}>
      <div className={styles.productCard__media}>
        <Skeleton width="100%" height="100%" />
      </div>

      <div className={styles.productCard__name}>
        <Skeleton count={2} width={['100%', '65%']} height="1rem" />
      </div>

      <div className={styles.productCard__refId}>
        <Skeleton width="45%" height="0.875rem" />
      </div>

      <div className={styles.productCard__price}>
        <Skeleton width="30%" height="1rem" />
      </div>

      <div className={styles.productCard__cart}>
        <div className={styles.productCard__quantityLabel}>
          <Skeleton width="4rem" height="0.875rem" />
        </div>
        <div className={styles.productCard__cartRow}>
          <Skeleton width="6.1875rem" height="3.125rem" />
          <Skeleton width="100%" height="3rem" />
        </div>
      </div>
    </div>
  )
}
