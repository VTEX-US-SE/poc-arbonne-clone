import NextLink from 'next/link'
import { useRouter } from 'next/router'

import { isInternalHref } from '../../utils/href'
import type { LinkProps } from './Link.types'

/**
 * Every link whose destination comes from the CMS. Three cases, decided per
 * value because one CMS field holds all three:
 *
 * - no href -- renders the children as text. An unfilled slug used to become
 *   `'#'`, which looked operable and silently jumped to the top of the page.
 * - same-site -- `next/link`, so navigation is client-side and prefetched
 *   rather than a full document reload.
 * - anything else -- a plain anchor. External URLs, `mailto:`, `tel:`.
 *
 * Product links are not routed through here: they use core's `useProductLink`,
 * which carries the click-attribution props Intelligent Search reads.
 */
export default function Link({ href, children, ...otherProps }: LinkProps) {
  const router = useRouter()

  if (!href) {
    const { className } = otherProps

    return <span className={className}>{children}</span>
  }

  if (isInternalHref(href)) {
    const current = router.asPath.split(/[?#]/)[0] === href

    return (
      <NextLink
        href={href}
        aria-current={current ? 'page' : undefined}
        {...otherProps}
      >
        {children}
      </NextLink>
    )
  }

  return (
    <a href={href} {...otherProps}>
      {children}
    </a>
  )
}
