import type { MobileNavItem } from '../Header/Header.types'

export interface MobileTabItemProps {
  item: MobileNavItem
  /**
   * Renders the item as a button when given, as a link to `item.url`
   * otherwise.
   */
  onActivate?: () => void
}
