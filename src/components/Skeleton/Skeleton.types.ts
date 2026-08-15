import type { ReactNode } from 'react'

export interface SkeletonProps {
  loading?: boolean
  count?: number
  width?: string | string[]
  height?: string
  border?: 'regular' | 'pill' | 'circle'
  children?: ReactNode
}
