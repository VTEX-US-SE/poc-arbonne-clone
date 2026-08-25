export interface SponsorPanelProps {
  open: boolean
  /**
   * Renders as a centred modal instead of a popover anchored to the badge. An
   * anchored panel has nowhere sensible to sit on a phone.
   */
  asModal?: boolean
  onClose: () => void
  onClear: () => void
  /** Whether this sponsor came from a followed link, and so can be dropped. */
  canClear?: boolean
  arbonneId: string
  displayName?: string | null
  profilePicture?: string | null
}
