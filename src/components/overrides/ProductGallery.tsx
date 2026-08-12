import type { SectionOverride } from 'src/typings/overrides'

import ProductCard from '../ProductCard/ProductCard'

const SECTION = 'ProductGallery' as const

/**
 * Puts the brand product card in core's gallery grid. This covers both the PLP
 * and the search results page -- they render the same section. Everything else
 * in the gallery (filters, sort, pagination, empty state) stays core's.
 *
 * No CMS work is needed for this: it replaces a component inside the section
 * already on those pages, not the section itself.
 */
const override: SectionOverride = {
  section: SECTION,
  components: {
    __experimentalProductCard: { Component: ProductCard },
  },
}

export { override }
