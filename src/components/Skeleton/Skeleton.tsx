import { Skeleton as UISkeleton } from '@faststore/ui'

import styles from './Skeleton.module.scss'
import type { SkeletonProps } from './Skeleton.types'

/**
 * Loading placeholder. Thin over `@faststore/ui`'s `Skeleton` atom -- that
 * already owns the shimmer, the tokens and the loading/children swap, and its
 * stylesheet is loaded globally by core, so nothing here re-declares any of it.
 *
 * What it adds is the repeated case: `count` with a cycling `width`, which is
 * how every text block and card grid in this project needs to render.
 *
 * Placeholders are hidden from assistive tech -- the shape is decoration, and
 * the real content announces itself when it lands.
 */
export default function Skeleton({
  loading = true,
  count = 1,
  width = '100%',
  height = '1rem',
  border,
  children,
}: SkeletonProps) {
  if (!loading) {
    return <>{children}</>
  }

  const widths = Array.isArray(width) ? width : [width]
  const bar = (index: number) => (
    <UISkeleton
      key={index}
      size={{ width: widths[index % widths.length], height }}
      border={border}
      aria-hidden="true"
    />
  )

  if (count === 1) {
    return bar(0)
  }

  return (
    <div className={styles.skeletonStack}>
      {Array.from({ length: count }, (_, index) => bar(index))}
    </div>
  )
}
