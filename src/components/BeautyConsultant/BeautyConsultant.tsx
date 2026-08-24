import { useEffect, useMemo, useRef, useState } from 'react'

import useAgentChat from '../../hooks/useAgentChat'
import ChatInput from './ChatInput/ChatInput'
import ChatStatus from './ChatStatus/ChatStatus'
import MessageBubble from './MessageBubble/MessageBubble'
import styles from './BeautyConsultant.module.scss'
import type {
  AgentChatMessage,
  BeautyConsultantProps,
} from './BeautyConsultant.types'

/**
 * The copy this section ships with. The CMS fields override it, but only when
 * they hold something: an entry saved with blank fields keeps this wording, so
 * the voice can be revised here without an Admin round-trip.
 */
const COPY = {
  eyebrow: 'Your personal consultation',
  headline: 'Tell us about you',
  intro:
    'Share your skin, your wellness goals, and how you want to feel. We will guide you to the clean, plant-powered products that suit you best.',
  welcomeMessage:
    'Tell me a little about you: your skin, your routine, and how you want to feel. I will guide you to the Arbonne products made for you.',
  placeholder: 'Tell us about your skin, your goals, how you want to feel...',
  starterPrompts: [
    'My skin feels dry and dull',
    'I want steady energy through the day',
    'Help me build a simple daily routine',
    "I'm new to Arbonne, where do I start?",
  ],
  disclaimer: 'Guidance for product discovery only, and not medical advice.',
  errorMessage: 'Your consultation is unavailable right now. Please try again.',
  resetLabel: 'Start over',
  logoAlt: 'Arbonne',
  conversationPrefix: 'arb',
}

function filled(value: string | undefined, fallback: string): string {
  return value?.trim() ? value : fallback
}

export default function BeautyConsultant({
  eyebrow,
  headline,
  intro,
  welcomeMessage,
  placeholder,
  starterPrompts,
  logo,
  logoAlt,
  backgroundImage,
  disclaimer,
  errorMessage,
  resetLabel,
  conversationPrefix,
}: BeautyConsultantProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const welcome = filled(welcomeMessage, COPY.welcomeMessage)
  const prompts = useMemo(() => {
    const chosen = (starterPrompts ?? [])
      .map((prompt) => prompt?.trim())
      .filter((prompt): prompt is string => Boolean(prompt))

    return chosen.length > 0 ? chosen : COPY.starterPrompts
  }, [starterPrompts])

  const { messages, waiting, error, canRetry, sendMessage, retry, reset } =
    useAgentChat({
      active: true,
      conversationPrefix: filled(conversationPrefix, COPY.conversationPrefix),
      errorMessage: filled(errorMessage, COPY.errorMessage),
    })

  const started = messages.length > 0

  // The welcome line opens the thread rather than sitting on the intro screen,
  // which stays a headline and a search field until the shopper writes.
  const thread = useMemo<AgentChatMessage[]>(
    () =>
      started
        ? [{ id: 'welcome', direction: 'out', text: welcome }, ...messages]
        : [],
    [messages, started, welcome]
  )

  useEffect(() => {
    document.body.dataset.arbBeautyConsultant = ''

    return () => {
      delete document.body.dataset.arbBeautyConsultant
    }
  }, [])

  useEffect(() => {
    if (!started) {
      return
    }

    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    })
  }, [started, thread, waiting, error])

  const submit = (value: string) => {
    const clean = value.trim()

    if (!clean) {
      return
    }

    setInput('')
    void sendMessage(clean)
  }

  return (
    <section
      className={styles.beautyConsultant}
      data-arb-beauty-consultant
      data-state={started ? 'chat' : 'intro'}
    >
      {backgroundImage && (
        <div
          className={styles.beautyConsultant__backdrop}
          style={{ backgroundImage: `url(${JSON.stringify(backgroundImage)})` }}
          aria-hidden="true"
        />
      )}

      <div className={styles.beautyConsultant__panel}>
        <header className={styles.beautyConsultant__intro}>
          {logo && (
            <img
              className={styles.beautyConsultant__logo}
              src={logo}
              alt={filled(logoAlt, COPY.logoAlt)}
            />
          )}
          <p className={styles.beautyConsultant__eyebrow}>
            {filled(eyebrow, COPY.eyebrow)}
          </p>
          <h1 className={styles.beautyConsultant__headline}>
            {filled(headline, COPY.headline)}
          </h1>
          {!started && (
            <p className={styles.beautyConsultant__copy}>
              {filled(intro, COPY.intro)}
            </p>
          )}
        </header>

        {started && (
          <div
            className={styles.beautyConsultant__messages}
            role="log"
            aria-live="polite"
            aria-relevant="additions"
          >
            {thread.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <ChatStatus
              waiting={waiting}
              error={error}
              canRetry={canRetry}
              onRetry={() => void retry()}
            />
            <div ref={messagesEndRef} />
          </div>
        )}

        <div className={styles.beautyConsultant__composer}>
          <ChatInput
            value={input}
            placeholder={filled(placeholder, COPY.placeholder)}
            onChange={setInput}
            onSubmit={() => submit(input)}
          />

          {!started && (
            <div
              className={styles.beautyConsultant__prompts}
              aria-label="Ways to start"
            >
              {prompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => submit(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <div className={styles.beautyConsultant__meta}>
            <p>{filled(disclaimer, COPY.disclaimer)}</p>
            {started && (
              <button
                type="button"
                onClick={() => {
                  reset()
                  setInput('')
                }}
              >
                {filled(resetLabel, COPY.resetLabel)}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
