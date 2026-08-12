import { useDeferredValue, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { Icon, useOnClickOutside } from '@faststore/ui'
import {
  useSuggestions_unstable as useSuggestions,
  // @ts-ignore next-line
} from '@faststore/core/experimental'
import { formatSearchPath } from 'src/sdk/search/formatSearchPath'

import styles from './SearchBox.module.scss'
import type { SearchBoxProps } from './SearchBox.types'

/**
 * Emphasises the matched part of a suggestion. Intelligent Search returns whole
 * phrases, so the term is not necessarily a prefix -- "intellig" comes back as
 * "arbonne intelligence".
 */
function highlight(value: string, term: string) {
  const index = value.toLowerCase().indexOf(term.toLowerCase())

  if (index < 0) {
    return value
  }

  return (
    <>
      {value.slice(0, index)}
      <strong>{value.slice(index, index + term.length)}</strong>
      {value.slice(index + term.length)}
    </>
  )
}

/**
 * Header search: an icon that expands into an input, with Intelligent Search
 * term suggestions below it. Built on core's `useSuggestions` rather than its
 * `SearchInput` component, which carries quick-order and file-upload features
 * this store has no use for. The hook also emits the
 * `intelligent_search_autocomplete_query` analytics event on its own.
 *
 * Suggestions are rendered as buttons so they are reachable by Tab without a
 * custom roving-focus implementation.
 */
export default function SearchBox({
  placeholder = "Find what you're looking for...",
}: SearchBoxProps) {
  const [expanded, setExpanded] = useState(false)
  const [term, setTerm] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const deferredTerm = useDeferredValue(term)
  const { data } = useSuggestions(deferredTerm)
  const suggestions: Array<{ value: string }> =
    data?.search?.suggestions?.terms ?? []

  const close = () => setExpanded(false)
  useOnClickOutside(containerRef, close)

  const search = (searchTerm: string) => {
    const trimmed = searchTerm.trim()

    if (!trimmed) {
      return
    }

    close()
    router.push(formatSearchPath({ term: trimmed }))
  }

  const showSuggestions = expanded && term.length > 0 && suggestions.length > 0

  return (
    <div className={styles.searchBox} ref={containerRef}>
      <button
        type="button"
        className={styles.searchBox__toggle}
        aria-label="Search"
        aria-expanded={expanded}
        onClick={() => {
          setExpanded(true)
          inputRef.current?.focus()
        }}
      >
        <Icon name="MagnifyingGlass" width={24} height={24} />
      </button>

      <form
        className={styles.searchBox__form}
        role="search"
        data-expanded={expanded}
        onSubmit={(event) => {
          event.preventDefault()
          search(term)
        }}
      >
        <input
          ref={inputRef}
          className={styles.searchBox__input}
          type="search"
          value={term}
          placeholder={placeholder}
          aria-label={placeholder}
          onChange={(event) => setTerm(event.target.value)}
          onFocus={() => setExpanded(true)}
          onKeyDown={(event) => event.key === 'Escape' && close()}
        />
      </form>

      {showSuggestions && (
        <ul className={styles.searchBox__suggestions}>
          {suggestions.map(({ value }) => (
            <li key={value}>
              <button
                type="button"
                className={styles.searchBox__suggestion}
                onClick={() => search(value)}
              >
                {highlight(value, term)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
