import type { AssemblyItem, QuantityChangeHandler } from '../AssemblySet.types'

export interface ItemCardProps {
  item: AssemblyItem
  quantity: number
  /** How many more units the group will still accept before its maximum. */
  groupRemaining: number
  onChange: QuantityChangeHandler
}
