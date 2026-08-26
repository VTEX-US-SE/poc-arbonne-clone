import type {
  AgentChatMessage,
  AgentProduct,
} from '../../BeautyConsultant/BeautyConsultant.types'

export interface AgentProductShelfProps {
  message: AgentChatMessage
  thread: AgentChatMessage[]
  index: number
  enableSearchShelf: boolean
  onAskAbout?: (product: AgentProduct) => void
}
