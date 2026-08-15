import type { AnchorHTMLAttributes, ReactNode } from 'react'

export interface LinkProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'href'
> {
  /**
   * Destination. `undefined` -- an unfilled CMS slug or url -- renders the
   * children as plain text instead of a link to nowhere.
   */
  href?: string
  children: ReactNode
}
