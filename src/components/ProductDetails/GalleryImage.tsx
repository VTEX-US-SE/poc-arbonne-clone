import {
  Image_unstable as Image,
  // @ts-ignore next-line
} from '@faststore/core/experimental'

import type { GalleryImageProps } from './ProductDetails.types'

/**
 * Feeds both the 496px viewer and the 72px thumbnails, so it is sized for
 * the larger of the two and reuses the same optimised URLs for both.
 */
export default function GalleryImage({
  url,
  alternateName,
}: GalleryImageProps) {
  return (
    <Image
      src={url}
      alt={alternateName ?? ''}
      width={496}
      height={496}
      sizes="(min-width: 80rem) 496px, 100vw"
    />
  )
}
