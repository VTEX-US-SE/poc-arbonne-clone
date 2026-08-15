import { useEffect, useState } from 'react'

import styles from './Header.module.scss'
import type { SkipLinkProps } from './Header.types'

const FALLBACK_ID = 'arb-main-content'

/**
 * Lets keyboard and screen-reader users jump the header, the mega nav and the
 * mobile tab bar -- a long run of repeated links before content on every page.
 *
 * The target is resolved at runtime because core renders no `<main>` landmark:
 * CMS sections are flat siblings, so the first one after the header's own
 * wrapper *is* the content. `tabIndex={-1}` is required on it, or the browser
 * moves the viewport without moving focus and the next Tab returns to the top
 * of the header.
 *
 * Renders nothing when no following section exists, rather than offering a
 * link that goes nowhere.
 */
export default function SkipLink({ label = 'Skip to content' }: SkipLinkProps) {
  const [targetId, setTargetId] = useState<string | null>(null)

  useEffect(() => {
    const header = document.querySelector('[data-arb-header]')
    const wrapper = header?.closest('.section') ?? header
    const target = wrapper?.nextElementSibling

    if (!(target instanceof HTMLElement)) {
      return
    }

    if (!target.id) {
      target.id = FALLBACK_ID
    }

    target.setAttribute('tabindex', '-1')
    setTargetId(target.id)
  }, [])

  if (!targetId) {
    return null
  }

  return (
    <a className={styles.header__skipLink} href={`#${targetId}`}>
      {label}
    </a>
  )
}
