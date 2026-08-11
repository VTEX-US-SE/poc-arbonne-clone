import { useRef, useState, type KeyboardEvent } from 'react'
import { useFormattedPrice_unstable as useFormattedPrice } from '@faststore/core/experimental'
import { useProductsQuery } from 'src/sdk/product/useProductsQuery'

import styles from './ProductShowcases.module.scss'
import type {
  ProductShowcasesProduct,
  ProductShowcasesProps,
} from './ProductShowcases.types'

function ProductTile({ product }: { product: ProductShowcasesProduct }) {
  const image = product.image?.[0]
  const price = useFormattedPrice(product.offers?.offers?.[0]?.price ?? 0)

  return (
    <a className={styles.productShowcases__card} href={`/${product.slug}/p`}>
      <span className={styles.productShowcases__media}>
        {image && (
          <img
            src={image.url}
            alt={image.alternateName ?? product.name}
            loading="lazy"
          />
        )}
      </span>
      <span className={styles.productShowcases__body}>
        <span className={styles.productShowcases__name}>{product.name}</span>
        {product.gtin && (
          <span className={styles.productShowcases__sku}>
            # {product.gtin} US
          </span>
        )}
        <span className={styles.productShowcases__price}>{price}</span>
      </span>
    </a>
  )
}

/**
 * Tabbed product grid ("Ready to Start Your Arbonne Journey?"). Each tab
 * names a VTEX collection; its products are fetched client-side from the
 * `productClusterIds` facet, so only the active tab is ever queried.
 *
 * Renders the tabs and grid only -- stack a `[ARB] Section Header` above
 * this in the CMS for the headline and intro copy.
 */
export default function ProductShowcases({
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
        {products.map(({ node }) => (
          <ProductTile
            key={node.slug}
            product={node as ProductShowcasesProduct}
          />
        ))}
      </div>
    </section>
  )
}
