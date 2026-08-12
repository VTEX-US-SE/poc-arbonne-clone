export interface ProductShowcasesTab {
  label: string
  collectionId: string
}

export interface ProductShowcasesProps {
  headline?: string
  text?: string
  tabs?: ProductShowcasesTab[]
  numberOfItems?: number
}
