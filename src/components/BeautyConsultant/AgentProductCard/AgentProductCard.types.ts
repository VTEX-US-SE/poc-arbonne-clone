import type { AgentProduct } from '../BeautyConsultant.types'

export interface AgentProductCardProps {
  product: AgentProduct
  variant?: 'link' | 'shelf'
  onAskAbout?: (product: AgentProduct) => void
}
