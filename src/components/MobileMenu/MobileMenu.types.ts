import type { HeaderNavItem } from '../Header/Header.types'

export interface MobileMenuProps {
  open: boolean
  onClose?: () => void
  navItems?: HeaderNavItem[]
}
