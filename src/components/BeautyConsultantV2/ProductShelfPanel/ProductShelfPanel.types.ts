import type {
  AgentChatMessage,
  AgentProduct,
} from '../../BeautyConsultant/BeautyConsultant.types'

export interface ProductShelfPanelProps {
  thread: AgentChatMessage[]
  enableSearchShelf: boolean
  emptyLabel: string
  waiting: boolean
  onAskAbout?: (product: AgentProduct) => void
}
