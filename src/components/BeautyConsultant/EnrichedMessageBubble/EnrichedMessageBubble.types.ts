import type { AgentChatMessage } from '../BeautyConsultant.types'

export interface EnrichedMessageBubbleProps {
  message: AgentChatMessage
  thread: AgentChatMessage[]
  index: number
  enableSearchShelf: boolean
}
