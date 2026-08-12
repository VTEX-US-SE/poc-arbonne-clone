/**
 * Turns a CMS slug into a same-site href. Leading slashes are stripped, so a
 * field filled in as either `skincare` or `/skincare` works -- `/${slug}` on a
 * value that already starts with a slash yields `//skincare`, which browsers
 * read as protocol-relative and resolve off-site.
 */
export const slugHref = (slug?: string) =>
  slug ? `/${slug.replace(/^\/+/, '')}` : '#'
