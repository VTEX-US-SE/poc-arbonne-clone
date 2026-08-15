/**
 * Turns a CMS slug into a same-site href, or `undefined` when the field was
 * never filled in. Leading slashes are stripped, so a field filled in as
 * either `skincare` or `/skincare` works -- `/${slug}` on a value that already
 * starts with a slash yields `//skincare`, which browsers read as
 * protocol-relative and resolve off-site.
 *
 * Returns `undefined` rather than `'#'`: a link to `'#'` looks operable, jumps
 * to the top of the page and reports nothing anywhere. Callers pass the result
 * straight to `Link`, which renders plain text when there is no destination.
 */
export const slugHref = (slug?: string) =>
  slug ? `/${slug.replace(/^\/+/, '')}` : undefined

/**
 * Whether Next's client router can own this href. Only same-site paths
 * qualify -- a scheme (`https:`, `mailto:`, `tel:`), a protocol-relative
 * `//host` or a bare fragment all have to stay on a plain anchor.
 *
 * CMS link fields hold both kinds, so this is decided per value at render
 * time, not per call site.
 */
export const isInternalHref = (href: string) =>
  href.startsWith('/') && !href.startsWith('//')
