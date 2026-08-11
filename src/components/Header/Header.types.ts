export interface HeaderLogo {
  src?: string
  alt?: string
  url?: string
}

export interface HeaderBanner {
  image?: string
  imageAlt?: string
  /** Renders above the headline (e.g. "GLP-1 NUTRITION SUPPORT"). */
  eyebrow?: string
  headline?: string
  /** Renders below the headline (e.g. "WITH ELIGIBLE PURCHASE") -- distinct from eyebrow. */
  subtitle?: string
  text?: string
  ctaText?: string
  ctaUrl?: string
}

export interface MobileNavItem {
  /** @default 'link' */
  type?: 'link' | 'modal' | 'menu'
  icon?: string
  label?: string
  /** Used when type is 'link'. */
  url?: string
  /** Used when type is 'modal'. */
  modal?: 'login' | 'country'
}

export interface HeaderProps {
  logo?: HeaderLogo
  navItems?: HeaderNavItem[]
  loginUrl?: string
  otpLoginUrl?: string
  createAccountText?: string
  accountCards?: LoginAccountCard[]
  countryOptions?: CountryOption[]
  /**
   * Independent, manually-curated content for the mobile bottom tab bar --
   * not derived from navItems (different count/members: e.g. "New!" lives
   * inside the desktop "Shop All" submenu, "Contact Us" doesn't exist in
   * the desktop nav at all).
   */
  mobileNavItems?: MobileNavItem[]
}

export interface LoginAccountCard {
  title: string
  subtitle?: string
  description?: string
  price?: string
  addToCartUrl?: string
  learnMoreUrl?: string
}

export interface CountryOption {
  label: string
  flag?: string
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
