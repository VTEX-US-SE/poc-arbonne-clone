import { useDeferredValue, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { Icon, useOnClickOutside } from '@faststore/ui'
import {
  useSuggestions_unstable as useSuggestions,
  // @ts-ignore next-line
} from '@faststore/core/experimental'
import { formatSearchPath } from 'src/sdk/search/formatSearchPath'

import useIsMobile from '../../hooks/useIsMobile'
import styles from './SearchBox.module.scss'
import type { SearchBoxProps } from './SearchBox.types'
import SearchProductRow from './SearchProductRow'
import type { ProductCardProduct } from '../ProductCard/ProductCard.types'

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
  const isMobile = useIsMobile()

  useEffect(() => {
    if (expanded) {
      inputRef.current?.focus()
    }
  }, [expanded])

  const deferredTerm = useDeferredValue(term)
  const { data } = useSuggestions(deferredTerm)
  const suggestions: Array<{ value: string }> =
    data?.search?.suggestions?.terms ?? []
  const products: ProductCardProduct[] =
    data?.search?.suggestions?.products ?? []

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

  const hasResults = suggestions.length > 0 || products.length > 0
  const showResults = expanded && term.length > 0 && hasResults

  const toggle = (
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
  )

  const field = (
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
  )

  const results = showResults && (
    <>
      {suggestions.length > 0 && (
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

      {products.length > 0 && (
        <div className={styles.searchBox__products}>
          {products.map((product, index) => (
            <SearchProductRow
              key={product.slug}
              product={product}
              index={index}
              onNavigate={close}
            />
          ))}
        </div>
      )}
    </>
  )

  if (isMobile) {
    return (
      <div className={styles.searchBox} ref={containerRef}>
        {toggle}

        {expanded && (
          <div className={styles.searchBox__panel}>
            <div className={styles.searchBox__panelBar}>
              <Icon name="MagnifyingGlass" width={22} height={22} />
              {field}
              <button
                type="button"
                className={styles.searchBox__close}
                onClick={close}
                aria-label="Close search"
              >
                <Icon name="X" weight="bold" width={20} height={20} />
              </button>
            </div>

            {results}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={styles.searchBox} ref={containerRef}>
      {toggle}
      {field}
      {showResults && (
        <div className={styles.searchBox__dropdown}>{results}</div>
      )}
    </div>
  )
}
