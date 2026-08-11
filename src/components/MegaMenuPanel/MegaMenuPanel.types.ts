import type { HeaderBanner, MegaMenuItem } from '../Header/Header.types'

export interface MegaMenuPanelProps {
  columns: MegaMenuItem[]
  banner?: HeaderBanner
  onClose?: () => void
}
