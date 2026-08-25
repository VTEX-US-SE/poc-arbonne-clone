export interface SponsorPanelProps {
  open: boolean
  /**
   * Renders as a centred modal instead of a popover anchored to the badge. An
   * anchored panel has nowhere sensible to sit on a phone.
   */
  asModal?: boolean
  onClose: () => void
  onClear: () => void
  arbonneId: string
  displayName?: string | null
  profilePicture?: string | null
}
