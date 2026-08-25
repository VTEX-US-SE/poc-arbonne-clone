import { useCallback, useEffect, useState } from 'react'

import {
  clearSponsorAttribution,
  readSponsorAttribution,
  subscribeSponsorAttribution,
} from '../utils/sponsorAttribution'
import useSponsorById from './useSponsorById'

/**
 * The consultant this visit is attributed to, for display anywhere on the site.
 *
 * Resolution is override, then the shopper's own sponsor, then nobody. The
 * middle step is not wired yet -- it needs `CL.sponsorId`, which requires a
 * logged-in shopper -- so today `clear` removes the badge entirely.
 *
 * The cookie is read in an effect rather than during render: it is not
 * available server-side, and reading it inline would make the first client
 * render disagree with the server's markup.
 */
export default function useSponsorAttribution() {
  const [arbonneId, setArbonneId] = useState('')

  // Subscribed rather than read once: on a landing page the cookie is written
  // after this has already mounted and found nothing.
  useEffect(() => {
    const sync = () => setArbonneId(readSponsorAttribution() ?? '')

    sync()

    return subscribeSponsorAttribution(sync)
  }, [])

  const { sponsor, loading } = useSponsorById(arbonneId)

  // No local `setState` -- clearing notifies, which syncs this and every other
  // reader.
  const clear = useCallback(() => {
    clearSponsorAttribution()
  }, [])

  return { arbonneId, sponsor, loading, clear }
}
