import type { AssemblyItem, QuantityChangeHandler } from '../AssemblySet.types'

export interface ItemCardProps {
  item: AssemblyItem
  quantity: number
  groupRemaining: number
  onChange: QuantityChangeHandler
}
