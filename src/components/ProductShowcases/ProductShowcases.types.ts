export interface ProductShowcasesTab {
  label: string
  collectionId: string
}

export interface ProductShowcasesProps {
  tabs?: ProductShowcasesTab[]
  numberOfItems?: number
}

export interface ProductShowcasesProduct {
  slug: string
  name: string
  gtin?: string | null
  image?: Array<{ url: string; alternateName?: string | null }> | null
  offers?: { offers?: Array<{ price?: number | null }> | null } | null
}
