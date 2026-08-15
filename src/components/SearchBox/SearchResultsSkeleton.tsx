import Skeleton from '../Skeleton/Skeleton'

import styles from './SearchBox.module.scss'
import type { SearchResultsSkeletonProps } from './SearchBox.types'

/** Suggestion widths, varied so the stack does not read as a solid block. */
const TERM_WIDTHS = ['70%', '55%', '80%']

/**
 * Placeholder for the suggestion dropdown, reusing SearchBox's own classes so
 * the panel opens at roughly its final height instead of snapping open once
 * Intelligent Search answers.
 */
export default function SearchResultsSkeleton({
  terms = 3,
  products = 3,
}: SearchResultsSkeletonProps) {
  return (
    <>
      <ul className={styles.searchBox__suggestions}>
        {Array.from({ length: terms }, (_, index) => (
          <li key={index} className={styles.searchBox__suggestion}>
            <Skeleton
              width={TERM_WIDTHS[index % TERM_WIDTHS.length]}
              height="0.875rem"
            />
          </li>
        ))}
      </ul>

      <div className={styles.searchBox__products}>
        {Array.from({ length: products }, (_, index) => (
          <div key={index} className={styles.searchBox__product}>
            <Skeleton width="3rem" height="3rem" />
            <div className={styles.searchBox__productInfo}>
              <Skeleton width="9rem" height="0.875rem" />
              <Skeleton width="4rem" height="0.875rem" />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
