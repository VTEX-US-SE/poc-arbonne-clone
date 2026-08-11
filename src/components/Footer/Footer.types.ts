export interface FooterLink {
  text: string
  url: string
}

export interface FooterLinkColumn {
  title?: string
  links?: FooterLink[]
}

export interface FooterSocialLink {
  icon?: string
  alt?: string
  url: string
}

export interface FooterProps {
  linkColumns?: FooterLinkColumn[]
  socialLinks?: FooterSocialLink[]
  bCorpBadgeImage?: string
  bCorpBadgeAlt?: string
  legalLinks?: FooterLink[]
  copyrightText?: string
}
