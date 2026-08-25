const DEFAULT_MESSAGES_URL = 'https://flows.weni.ai/api/v2/messages.json'
const MAX_MESSAGE_LENGTH = 2_000
const CONTACT_ID_PATTERN = /^[a-z][a-z0-9_-]{1,31}:[a-z0-9_-]{6,80}$/i

interface WeniMessage {
  id?: string | number
  direction?: string
  text?: string
  created_on?: string
}

interface WeniMessagesResponse {
  results?: WeniMessage[]
}

export interface AgentMessage {
  id: string
  direction: string
  text: string
  createdOn?: string
}

function contactIdFromUrn(urn: string): string | null {
  if (!urn.startsWith('ext:')) {
    return null
  }

  const contactId = urn.slice(4)

  return CONTACT_ID_PATTERN.test(contactId) ? contactId : null
}

export async function getAgentMessages(urn: string): Promise<AgentMessage[]> {
  const token = process.env.WENI_TOKEN
  const contactId = contactIdFromUrn(urn)

  if (!token || !contactId) {
    return []
  }

  try {
    const messagesUrl = process.env.WENI_MESSAGES_URL || DEFAULT_MESSAGES_URL
    const url = new URL(messagesUrl)
    url.searchParams.set('urn', `ext:${contactId}`)
    const response = await fetch(url, {
      headers: { Authorization: `Token ${token}` },
    })

    if (!response.ok) {
      return []
    }

    const data = (await response.json()) as WeniMessagesResponse

    return (data.results ?? [])
      .filter(
        (message): message is WeniMessage & { id: string | number } =>
          message.id !== undefined && message.id !== null
      )
      .map((message) => ({
        id: String(message.id),
        direction: String(message.direction ?? ''),
        text: String(message.text ?? ''),
        createdOn: message.created_on,
      }))
  } catch {
    return []
  }
}

export async function sendAgentMessage({
  from,
  message,
  contactName,
}: {
  from: string
  message: string
  contactName?: string
}): Promise<boolean> {
  const receiveUrl = process.env.WENI_RECEIVE_URL
  const cleanMessage = message.trim()

  if (
    !receiveUrl ||
    !CONTACT_ID_PATTERN.test(from) ||
    cleanMessage.length === 0 ||
    cleanMessage.length > MAX_MESSAGE_LENGTH
  ) {
    return false
  }

  try {
    const response = await fetch(receiveUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: `${Date.now()}${Math.floor(Math.random() * 1_000)}`,
        from,
        message: cleanMessage,
        contact_name: contactName?.trim().slice(0, 120) || 'Arbonne customer',
        date: new Date().toISOString(),
      }),
    })

    return response.ok
  } catch {
    return false
  }
}
