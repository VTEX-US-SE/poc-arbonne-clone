import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { request } from 'src/sdk/graphql/request'
import { useQuery } from 'src/sdk/graphql/useQuery'

import type { AgentChatMessage } from '../components/BeautyConsultant/BeautyConsultant.types'
import {
  agentMessagesQuery,
  sendAgentMessageMutation,
} from '../graphql/queries/agentChat'
import { parseAgentText } from '../utils/agentChat'

const POLL_FAST = 1_000
const POLL_IDLE = 5_000
const DECAY_TO_IDLE_MS = 15_000
const STOP_AFTER_MS = 180_000

interface AgentMessagesData {
  arbAgentMessages: Array<{
    id: string
    direction: string
    text: string
    createdOn?: string | null
  }>
}

interface AgentMessagesVariables {
  urn: string
}

interface SendAgentMessageData {
  arbSendAgentMessage: boolean
}

interface SendAgentMessageVariables {
  from: string
  message: string
  contactName?: string
}

function normalisePrefix(prefix: string): string {
  const clean = prefix
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '')
    .slice(0, 32)

  return /^[a-z][a-z0-9_-]+$/.test(clean) ? clean : 'arb'
}

function createContactId(prefix: string): string {
  const random = `${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 10)}`

  return `${normalisePrefix(prefix)}:${random}`
}

export default function useAgentChat({
  active,
  conversationPrefix,
  errorMessage,
}: {
  active: boolean
  conversationPrefix: string
  errorMessage: string
}) {
  const [contactId, setContactId] = useState<string | null>(null)
  const [pending, setPending] = useState<AgentChatMessage[]>([])
  const [waiting, setWaiting] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(
    null
  )
  const [pollInterval, setPollInterval] = useState(POLL_FAST)
  const lastAgentMessageId = useRef<string | null>(null)
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([])

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }, [])

  const bumpActivity = useCallback(() => {
    clearTimers()
    setPollInterval(POLL_FAST)
    timers.current.push(
      setTimeout(() => setPollInterval(POLL_IDLE), DECAY_TO_IDLE_MS),
      setTimeout(() => setPollInterval(0), STOP_AFTER_MS)
    )
  }, [clearTimers])

  useEffect(() => {
    setContactId(createContactId(conversationPrefix))
  }, [conversationPrefix])

  useEffect(() => {
    if (active) {
      bumpActivity()
    }
  }, [active, bumpActivity])

  useEffect(() => clearTimers, [clearTimers])

  const urn = contactId ? `ext:${contactId}` : ''
  const { data, error: queryError } = useQuery<
    AgentMessagesData,
    AgentMessagesVariables
  >(
    agentMessagesQuery,
    { urn },
    {
      doNotRun: !active || !urn,
      refreshInterval: waiting ? POLL_FAST : pollInterval,
    }
  )

  const serverMessages = useMemo<AgentChatMessage[]>(
    () =>
      [...(data?.arbAgentMessages ?? [])]
        .reverse()
        .filter(
          (message) => message.direction === 'in' || message.direction === 'out'
        )
        .map((message) => {
          if (message.direction === 'in') {
            return {
              id: message.id,
              direction: 'in',
              text: message.text,
            }
          }

          return {
            id: message.id,
            direction: 'out',
            ...parseAgentText(message.text),
          }
        }),
    [data]
  )

  useEffect(() => {
    const latestAgentMessage = [...serverMessages]
      .reverse()
      .find((message) => message.direction === 'out')

    if (
      latestAgentMessage &&
      latestAgentMessage.id !== lastAgentMessageId.current
    ) {
      lastAgentMessageId.current = latestAgentMessage.id
      setWaiting(false)
      bumpActivity()
    }
  }, [serverMessages, bumpActivity])

  const messages = useMemo(() => {
    const echoed = new Set(
      serverMessages
        .filter((message) => message.direction === 'in')
        .map((message) => message.text)
    )

    return [
      ...serverMessages,
      ...pending.filter((message) => !echoed.has(message.text)),
    ]
  }, [pending, serverMessages])

  const deliver = useCallback(
    async (message: string) => {
      if (!contactId) {
        return false
      }

      try {
        const result = await request<
          SendAgentMessageData,
          SendAgentMessageVariables
        >(sendAgentMessageMutation, {
          from: contactId,
          message,
          contactName: 'Arbonne customer',
        })

        if (!result?.arbSendAgentMessage) {
          throw new Error('Agent message was not accepted')
        }

        setSendError(null)
        setLastFailedMessage(null)
        setWaiting(true)
        bumpActivity()

        return true
      } catch {
        setSendError(errorMessage)
        setLastFailedMessage(message)
        setWaiting(false)

        return false
      }
    },
    [bumpActivity, contactId, errorMessage]
  )

  const sendMessage = useCallback(
    async (message: string) => {
      const clean = message.trim().slice(0, 2_000)

      if (!clean || !contactId) {
        return false
      }

      setPending((current) => [
        ...current,
        {
          id: `local-${Date.now()}`,
          direction: 'in',
          text: clean,
        },
      ])
      setSendError(null)

      return deliver(clean)
    },
    [contactId, deliver]
  )

  const retry = useCallback(
    () =>
      lastFailedMessage ? deliver(lastFailedMessage) : Promise.resolve(false),
    [deliver, lastFailedMessage]
  )

  const reset = useCallback(() => {
    clearTimers()
    setContactId(createContactId(conversationPrefix))
    setPending([])
    setWaiting(false)
    setSendError(null)
    setLastFailedMessage(null)
    setPollInterval(POLL_FAST)
    lastAgentMessageId.current = null
    bumpActivity()
  }, [bumpActivity, clearTimers, conversationPrefix])

  return {
    messages,
    waiting,
    error: sendError ?? (queryError ? errorMessage : null),
    canRetry: Boolean(lastFailedMessage),
    sendMessage,
    retry,
    reset,
  }
}
