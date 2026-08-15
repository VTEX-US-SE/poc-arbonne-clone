import type { ReactNode } from 'react'

export interface SkeletonProps {
  /**
   * Shows the placeholder while true, `children` once false. Mirrors core's
   * own skeleton components, so a call site reads as one expression rather
   * than a ternary.
   *
   * @default true
   */
  loading?: boolean
  /**
   * How many bars to stack. At 1 the bar is returned bare, so it drops into
   * whatever grid or flex row the caller already has; above 1 the bars are
   * wrapped in a stack of their own.
   *
   * @default 1
   */
  count?: number
  /**
   * Bar width. An array cycles across the bars, which is what stops a stack
   * of text lines reading as a solid block -- pass the real copy's rhythm,
   * e.g. `['100%', '90%', '60%']`.
   *
   * @default '100%'
   */
  width?: string | string[]
  /** @default '1rem' */
  height?: string
  /** Matches the radius of whatever the bar stands in for. */
  border?: 'regular' | 'pill' | 'circle'
  children?: ReactNode
}
