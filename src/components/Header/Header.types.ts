import type { LoginAccountCard } from '../LoginModal/LoginModal.types'

export interface HeaderLogo {
  src?: string
  alt?: string
  url?: string
}

export interface HeaderBanner {
  image?: string
  imageAlt?: string
  eyebrow?: string
  headline?: string
  subtitle?: string
  text?: string
  ctaText?: string
  ctaUrl?: string
}

export interface MobileNavItem {
  type?: 'link' | 'modal' | 'menu'
  icon?: string
  label?: string
  url?: string
  modal?: 'login' | 'country'
}

export interface SkipLinkProps {
  label?: string
}

export interface HeaderProps {
  logo?: HeaderLogo
  navItems?: HeaderNavItem[]
  createAccountText?: string
  searchPlaceholder?: string
  accountCards?: LoginAccountCard[]
  countryOptions?: CountryOption[]
  mobileNavItems?: MobileNavItem[]
}

export interface CountryOption {
  label: string
  active?: boolean
}

/**
 * A nav item, a column header, or a plain link -- same shape at every
 * level (up to 3 deep: top item -> column -> link). Whether a node
 * renders as a header+sublist or a plain link is decided by whether it
 * has its own `menu`, not by its depth -- see MegaMenuPanel.
 */
export interface MegaMenuItem {
  name?: string
  slug?: string
  menu?: MegaMenuItem[]
}

/** A top-level nav item -- the only level that carries a promo banner. */
export interface HeaderNavItem extends MegaMenuItem {
  banner?: HeaderBanner
}
