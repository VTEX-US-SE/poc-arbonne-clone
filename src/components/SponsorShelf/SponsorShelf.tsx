import { useId } from 'react'
import { Carousel, Icon, ProductShelf } from '@faststore/ui'
import { useProductsQuery } from 'src/sdk/product/useProductsQuery'

import useIsMobile from '../../hooks/useIsMobile'
import useSponsor from '../../hooks/useSponsor'
import ProductCard from '../ProductCard/ProductCard'
import ProductCardSkeleton from '../ProductCard/ProductCardSkeleton'
import styles from './SponsorShelf.module.scss'
import type { SponsorShelfProps } from './SponsorShelf.types'

/**
 * The collection a consultant picked, as a carousel.
 *
 * The collection id comes from that consultant's Sponsors List row rather than
 * from a CMS field, which is why this exists instead of core's `ProductShelf`
 * section -- CMS props are fixed per page, and one page serves every
 * consultant.
 *
 * `ProductShelf` and `Carousel` here are the presentational primitives from
 * `@faststore/ui`, not core's data-fetching section, so the query and the cards
 * are ours.
 */
export default function SponsorShelf({ numberOfItems = 8 }: SponsorShelfProps) {
  const id = useId()
  const isMobile = useIsMobile()
  const { sponsor, loading: sponsorLoading } = useSponsor()

  const collectionId = sponsor?.displayCollection ?? ''

  const data = useProductsQuery({
    first: numberOfItems,
    sort: 'score_desc',
    term: '',
    selectedFacets: collectionId
      ? [{ key: 'productClusterIds', value: collectionId }]
      : [],
  })

  const loading = sponsorLoading || data?.search?.products === undefined
  const products = data?.search?.products?.edges ?? []

  // Nothing to show rather than an empty frame: without a `?sponsor=` there is
  // no consultant, and a consultant who picked no collection has no shelf.
  if (!sponsorLoading && !collectionId) {
    return null
  }

  if (!loading && products.length === 0) {
    return null
  }

  const itemsPerPage = isMobile ? 1 : 4

  return (
    <section className={styles.sponsorShelf}>
      <ProductShelf>
        {loading ? (
          <div className={styles.sponsorShelf__loading}>
            {Array.from({ length: itemsPerPage }, (_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <Carousel
            id={id}
            itemsPerPage={itemsPerPage}
            variant={isMobile ? 'slide' : 'scroll'}
            controls={isMobile ? 'paginationBullets' : 'complete'}
            infiniteMode={false}
            navigationIcons={{
              left: <Icon name="CaretLeft" />,
              right: <Icon name="CaretRight" />,
            }}
          >
            {products.map(({ node }, index) => (
              // `data-fs-carousel-item` is what the track sizes against.
              <div
                className={styles.sponsorShelf__item}
                data-fs-carousel-item
                key={node.slug}
              >
                <ProductCard index={index} product={node} staticCard />
              </div>
            ))}
          </Carousel>
        )}
      </ProductShelf>
    </section>
  )
}
