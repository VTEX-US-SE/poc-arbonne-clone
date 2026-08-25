export interface BeautyConsultantProps {
  eyebrow?: string
  headline?: string
  intro?: string
  welcomeMessage?: string
  placeholder?: string
  starterPrompts?: string[]
  logo?: string
  logoAlt?: string
  backgroundImage?: string
  disclaimer?: string
  errorMessage?: string
  resetLabel?: string
  conversationPrefix?: string
}

export interface AgentProduct {
  sku: string
  seller: string
  name: string
  price?: number
  image?: string
  url?: string
}

export interface AgentChatMessage {
  id: string
  direction: 'in' | 'out'
  text: string
  products?: AgentProduct[]
  header?: string
}
