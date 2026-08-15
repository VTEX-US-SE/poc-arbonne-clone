import Skeleton from '../../Skeleton/Skeleton'
import itemCardStyles from '../ItemCard/ItemCard.module.scss'
import setGroupStyles from '../SetGroup/SetGroup.module.scss'

import styles from '../AssemblySet.module.scss'
import type { AssemblySetSkeletonProps } from '../AssemblySet.types'

/**
 * Placeholder for the set builder. Reuses the real components' own classes so
 * the two-column layout, the card grid and the summary keep their positions
 * once the composition lands -- which is why this reaches across the three
 * stylesheets rather than owning one of its own. A skeleton with independent
 * styles is a skeleton that drifts.
 *
 * The real group count is not known until the query resolves; one group is
 * always drawn, which is what every set on this catalog has.
 */
export default function AssemblySetSkeleton({
  items = 4,
}: AssemblySetSkeletonProps) {
  return (
    <section className={styles.assemblySet} data-arb-assembly-set>
      <div className={styles.assemblySet__inner}>
        <div className={styles.assemblySet__aside}>
          <div className={styles.assemblySet__asideImage}>
            <Skeleton width="100%" height="100%" />
          </div>
          <div className={styles.assemblySet__title}>
            <Skeleton width="70%" height="2rem" />
          </div>
          <div className={styles.assemblySet__subtitle}>
            <Skeleton width="50%" height="1rem" />
          </div>
        </div>

        <div className={styles.assemblySet__panel}>
          <div className={styles.assemblySet__back}>
            <Skeleton width="11rem" height="1rem" />
          </div>

          <div className={setGroupStyles.setGroup}>
            <div className={setGroupStyles.setGroup__intro}>
              <div className={setGroupStyles.setGroup__headline}>
                <Skeleton width="60%" height="1.75rem" />
              </div>

              <div className={setGroupStyles.setGroup__progressBox}>
                <Skeleton width="100%" height="0.375rem" border="pill" />
                <div className={setGroupStyles.setGroup__hint}>
                  <Skeleton width="45%" height="0.875rem" />
                </div>
              </div>
            </div>

            <ul className={setGroupStyles.setGroup__grid}>
              {Array.from({ length: items }, (_, index) => (
                <li key={index} className={itemCardStyles.itemCard}>
                  <Skeleton width="4.6875rem" height="4.6875rem" />
                  <div className={itemCardStyles.itemCard__body}>
                    <Skeleton
                      count={2}
                      width={['100%', '55%']}
                      height="0.875rem"
                    />
                    <Skeleton width="6.1875rem" height="3.125rem" />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.assemblySet__summary}>
            <div className={styles.assemblySet__summaryTitle}>
              <Skeleton width="14rem" height="1.5rem" />
            </div>
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className={styles.assemblySet__row}>
                <Skeleton width="9rem" height="1rem" />
                <Skeleton width="4rem" height="1rem" />
              </div>
            ))}
          </div>

          <div className={styles.assemblySet__actions}>
            <Skeleton width="100%" height="3rem" />
          </div>
        </div>
      </div>
    </section>
  )
}
