import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/router'

import useAgentChat from '../../hooks/useAgentChat'
import {
  BEAUTY_CONSULTANT_SHELF_PREVIEW,
  buildShelfPreviewThread,
} from '../../utils/beautyConsultantPreview'
import { DEFAULT_BEAUTY_CONSULTANT_LOGO } from '../../utils/beautyConsultantBrand'
import CartButton from '../CartButton/CartButton'
import ChatInput from '../BeautyConsultant/ChatInput/ChatInput'
import ChatStatus from '../BeautyConsultant/ChatStatus/ChatStatus'
import ConversationBubble from './ConversationBubble/ConversationBubble'
import ProductShelfPanel from './ProductShelfPanel/ProductShelfPanel'
import styles from './BeautyConsultantV2.module.scss'
import type { AgentChatMessage } from '../BeautyConsultant/BeautyConsultant.types'
import type { BeautyConsultantProps } from './BeautyConsultantV2.types'

const COPY = {
  welcomeMessage:
    'Tell me a little about you: your skin, your routine, and how you want to feel. I will guide you to the Arbonne products made for you.',
  placeholder: 'Tell us about your skin, your goals, how you want to feel...',
  followUpPlaceholder: 'Ask a follow-up or refine what you are looking for...',
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
  productEmpty:
    'Matching Arbonne products will appear here as we learn more about you.',
}

function filled(value: string | undefined, fallback: string): string {
  return value?.trim() ? value : fallback
}

export default function BeautyConsultantV2({
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
  const router = useRouter()
  const [input, setInput] = useState('')
  const conversationRef = useRef<HTMLDivElement>(null)
  const threadLengthRef = useRef(0)

  const previewShelf = router.query.preview === BEAUTY_CONSULTANT_SHELF_PREVIEW

  const welcome = filled(welcomeMessage, COPY.welcomeMessage)
  const prompts = useMemo(() => {
    const chosen = (starterPrompts ?? [])
      .map((prompt) => prompt?.trim())
      .filter((prompt): prompt is string => Boolean(prompt))

    return chosen.length > 0 ? chosen : COPY.starterPrompts
  }, [starterPrompts])

  const { messages, waiting, error, canRetry, sendMessage, retry, reset } =
    useAgentChat({
      active: !previewShelf,
      conversationPrefix: filled(conversationPrefix, COPY.conversationPrefix),
      errorMessage: filled(errorMessage, COPY.errorMessage),
    })

  const started = previewShelf || messages.length > 0

  const thread = useMemo<AgentChatMessage[]>(() => {
    if (previewShelf) {
      return buildShelfPreviewThread(welcome)
    }

    return started
      ? [{ id: 'welcome', direction: 'out', text: welcome }, ...messages]
      : []
  }, [messages, previewShelf, started, welcome])

  useEffect(() => {
    document.body.dataset.arbBeautyConsultant = ''

    return () => {
      delete document.body.dataset.arbBeautyConsultant
    }
  }, [])

  useEffect(() => {
    if (!started || thread.length === threadLengthRef.current) {
      return
    }

    threadLengthRef.current = thread.length

    const panel = conversationRef.current

    if (!panel) {
      return
    }

    panel.scrollTo({
      top: panel.scrollHeight,
      behavior: 'smooth',
    })
  }, [started, thread.length])

  const submit = useCallback(
    (value: string) => {
      if (previewShelf) {
        return
      }

      const clean = value.trim()

      if (!clean) {
        return
      }

      setInput('')
      void sendMessage(clean)
    },
    [previewShelf, sendMessage]
  )

  const askAboutProduct = useCallback(
    (product: { name: string }) => {
      submit(`Tell me more about ${product.name}`)
    },
    [submit]
  )

  const searchPlaceholder = started
    ? filled(placeholder, COPY.followUpPlaceholder)
    : filled(placeholder, COPY.placeholder)

  const logoSrc = filled(logo, DEFAULT_BEAUTY_CONSULTANT_LOGO)

  return (
    <section
      className={styles.beautyConsultantV2}
      data-arb-beauty-consultant
      data-state={started ? 'active' : 'intro'}
    >
      {backgroundImage && (
        <div
          className={styles.beautyConsultantV2__backdrop}
          style={{ backgroundImage: `url(${JSON.stringify(backgroundImage)})` }}
          aria-hidden="true"
        />
      )}

      <div className={styles.beautyConsultantV2__layout}>
        <header className={styles.beautyConsultantV2__header}>
          <div className={styles.beautyConsultantV2__headerTop}>
            <img
              className={styles.beautyConsultantV2__logo}
              src={logoSrc}
              alt={filled(logoAlt, COPY.logoAlt)}
            />
            <div className={styles.beautyConsultantV2__cart}>
              <CartButton />
            </div>
          </div>

          <div className={styles.beautyConsultantV2__search}>
            <ChatInput
              value={input}
              placeholder={searchPlaceholder}
              disabled={previewShelf}
              variant="light"
              onChange={setInput}
              onSubmit={() => submit(input)}
            />
          </div>
        </header>

        {started ? (
          <div className={styles.beautyConsultantV2__workspace}>
            <div
              ref={conversationRef}
              className={styles.beautyConsultantV2__conversation}
              role="log"
              aria-live="polite"
              aria-relevant="additions"
            >
              {previewShelf && (
                <p className={styles.beautyConsultantV2__previewNote}>
                  Preview — simulated catalog shelf with live Arbonne products
                </p>
              )}
              {thread.map((message) => (
                <ConversationBubble key={message.id} message={message} />
              ))}
              {!previewShelf && (
                <ChatStatus
                  waiting={waiting}
                  error={error}
                  canRetry={canRetry}
                  variant="light"
                  onRetry={() => void retry()}
                />
              )}
            </div>

            <ProductShelfPanel
              thread={thread}
              enableSearchShelf={!previewShelf}
              emptyLabel={COPY.productEmpty}
              waiting={waiting}
              onAskAbout={previewShelf ? undefined : askAboutProduct}
            />
          </div>
        ) : (
          <div
            className={styles.beautyConsultantV2__prompts}
            aria-label="Ways to start"
          >
            {prompts.map((prompt) => (
              <button key={prompt} type="button" onClick={() => submit(prompt)}>
                {prompt}
              </button>
            ))}
          </div>
        )}

        <div className={styles.beautyConsultantV2__meta}>
          <p>{filled(disclaimer, COPY.disclaimer)}</p>
          {started && !previewShelf && (
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
          {previewShelf && (
            <button
              type="button"
              onClick={() => {
                void router.push('/beauty-consultant')
              }}
            >
              Exit preview
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
