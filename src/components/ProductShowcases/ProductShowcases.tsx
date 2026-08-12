import { useRef, useState, type KeyboardEvent } from 'react'
import { useProductsQuery } from 'src/sdk/product/useProductsQuery'
import ProductCard from '../ProductCard/ProductCard'

import styles from './ProductShowcases.module.scss'
import type { ProductShowcasesProps } from './ProductShowcases.types'

/**
 * Tabbed product grid ("Ready to Start Your Arbonne Journey?"). Each tab
 * names a VTEX collection; its products are fetched client-side from the
 * `productClusterIds` facet, so only the active tab is ever queried.
 *
 * Owns its own rule/headline/intro block, so it needs a single CMS section
 * rather than being stacked under an `[ARB] Section Header`.
 */
export default function ProductShowcases({
  headline,
  text,
  tabs = [],
  numberOfItems = 4,
}: ProductShowcasesProps) {
  const [activeTab, setActiveTab] = useState(0)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const collectionId = tabs[activeTab]?.collectionId ?? ''

  const data = useProductsQuery({
    first: numberOfItems,
    sort: 'score_desc',
    term: '',
    selectedFacets: collectionId
      ? [{ key: 'productClusterIds', value: collectionId }]
      : [],
  })

  if (tabs.length === 0) {
    return null
  }

  const products = data?.search?.products?.edges ?? []

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const delta =
      event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0

    if (delta === 0) {
      return
    }

    event.preventDefault()
    const next = (activeTab + delta + tabs.length) % tabs.length
    setActiveTab(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <section className={styles.productShowcases}>
      {(headline || text) && (
        <div className={styles.productShowcases__header}>
          <hr className={styles.productShowcases__rule} />
          {headline && (
            <h2 className={styles.productShowcases__headline}>{headline}</h2>
          )}
          {text && <p className={styles.productShowcases__intro}>{text}</p>}
        </div>
      )}

      <div
        className={styles.productShowcases__tabs}
        role="tablist"
        aria-label="Product categories"
        onKeyDown={onKeyDown}
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            ref={(node) => {
              tabRefs.current[index] = node
            }}
            type="button"
            role="tab"
            id={`product-showcases-tab-${index}`}
            aria-selected={index === activeTab}
            aria-controls="product-showcases-panel"
            tabIndex={index === activeTab ? 0 : -1}
            data-active={index === activeTab}
            className={styles.productShowcases__tab}
            onClick={() => setActiveTab(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        id="product-showcases-panel"
        role="tabpanel"
        aria-labelledby={`product-showcases-tab-${activeTab}`}
        className={styles.productShowcases__grid}
      >
        {products.map(({ node }, index) => (
          <ProductCard key={node.slug} index={index} product={node} />
        ))}
      </div>
    </section>
  )
}
