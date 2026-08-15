import type { MobileNavItem } from '../Header/Header.types'

export interface MobileTabItemProps {
  item: MobileNavItem
  onActivate?: () => void
}
