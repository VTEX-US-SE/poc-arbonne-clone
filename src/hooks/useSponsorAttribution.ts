import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'src/sdk/session'

import {
  clearSponsorAttribution,
  readSponsorAttribution,
  subscribeSponsorAttribution,
  writeSponsorToSession,
} from '../utils/sponsorAttribution'
import useSponsorById from './useSponsorById'
import useSponsorOfRecord from './useSponsorOfRecord'

/**
 * The consultant this visit is attributed to, for display anywhere on the site.
 *
 * Resolution is the followed link, then the shopper's own sponsor, then nobody.
 * The link wins while its cookie lives because following it is the more recent
 * deliberate act. `clear` only ever drops a followed link -- see `canClear` --
 * so it means "stop using this link" and never "remove my consultant".
 *
 * The cookie is read in an effect rather than during render: it is not
 * available server-side, and reading it inline would make the first client
 * render disagree with the server's markup.
 */
export default function useSponsorAttribution() {
  const [override, setOverride] = useState('')

  useEffect(() => {
    const sync = () => setOverride(readSponsorAttribution() ?? '')

    sync()

    return subscribeSponsorAttribution(sync)
  }, [])

  const followed = useSponsorById(override)
  const { person } = useSession()

  // Skipped when a link is in play, since that wins anyway, and when nobody is
  // signed in -- the resolver has no cookie to identify then, and the badge is
  // on every page for every visitor.
  const ofRecord = useSponsorOfRecord({
    doNotRun: Boolean(override) || !person?.id,
  })

  const clear = useCallback(() => {
    clearSponsorAttribution()
  }, [])

  const sponsor = followed.sponsor ?? ofRecord.sponsor
  const arbonneId = sponsor?.arbonneId ?? ''
  const loading = followed.loading || ofRecord.loading

  /**
   * The order is attributed to whoever the badge is showing, so the stamp
   * follows the same resolution rather than only the landing page: a shopper
   * bound to a consultant carries them on every order, and following another
   * consultant's link takes over while its cookie lives.
   *
   * Held back until the lookups settle -- writing mid-resolve would clear the
   * value and then put it straight back.
   */
  useEffect(() => {
    if (loading) return

    writeSponsorToSession(arbonneId)
  }, [arbonneId, loading])

  return {
    arbonneId,
    sponsor,
    loading,
    /**
     * Only a followed link can be dropped. The sponsor of record is the
     * shopper's own binding, which is not this control's to undo -- changing it
     * belongs to enrollment, not to a link in the header.
     */
    canClear: Boolean(followed.sponsor),
    clear,
  }
}
