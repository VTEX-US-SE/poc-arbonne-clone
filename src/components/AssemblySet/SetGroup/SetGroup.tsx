import { expandTokens, groupTotal } from '../../../utils/assemblySet'
import ItemCard from '../ItemCard/ItemCard'

import styles from './SetGroup.module.scss'
import type { SetGroupProps } from './SetGroup.types'

/**
 * One independent min/max gate from the catalog composition: headline,
 * progress bar and the grid of eligible children.
 */
export default function SetGroup({
  group,
  quantities,
  headline,
  hint,
  completeHint,
  onChange,
}: SetGroupProps) {
  const total = groupTotal(group, quantities)
  const remaining = group.maxQuantity - total
  const complete = group.maxQuantity > 0 && total >= group.maxQuantity
  const hintText = (complete && completeHint) || hint
  const tokens = {
    min: group.minQuantity,
    max: group.maxQuantity,
    selected: total,
  }

  return (
    <div className={styles.setGroup}>
      <div className={styles.setGroup__intro}>
        <h2 className={styles.setGroup__headline}>
          {expandTokens(headline || group.name, tokens)}
        </h2>

        <div className={styles.setGroup__progressBox}>
          <div
            className={styles.setGroup__progress}
            role="progressbar"
            aria-valuenow={total}
            aria-valuemin={0}
            aria-valuemax={group.maxQuantity}
            aria-label={`${total} of ${group.maxQuantity} selected`}
          >
            <span
              className={styles.setGroup__progressFill}
              data-complete={complete}
              style={{
                width: `${Math.min((total / group.maxQuantity) * 100, 100)}%`,
              }}
            />
            <span
              className={styles.setGroup__progressKnob}
              data-complete={complete}
              aria-hidden="true"
            >
              {complete ? '✓' : null}
            </span>
          </div>

          {hintText && (
            <p className={styles.setGroup__hint} data-complete={complete}>
              <span
                className={styles.setGroup__hintBullet}
                data-complete={complete}
                aria-hidden="true"
              >
                {complete ? '✓' : null}
              </span>
              {expandTokens(hintText, tokens)}
            </p>
          )}
        </div>
      </div>

      <ul className={styles.setGroup__grid}>
        {group.items.map((item) => (
          <ItemCard
            key={item.skuId}
            item={item}
            quantity={quantities[item.skuId] ?? 0}
            groupRemaining={remaining}
            onChange={onChange}
          />
        ))}
      </ul>
    </div>
  )
}
