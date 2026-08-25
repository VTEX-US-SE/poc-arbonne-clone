import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { sessionStore } from 'src/sdk/session'

import { writeSponsorAttribution } from '../utils/sponsorAttribution'
import useSponsorById from './useSponsorById'

/**
 * The consultant named by `?sponsor=<arbonneId>`, or `null`.
 *
 * Following a consultant's link is the act that attributes a visit to them, so
 * a successful lookup here is what persists it -- last link followed wins. Two
 * places, for two readers: a cookie the header reads to name them, and the
 * session, which is what carries the attribution to the order.
 *
 * The session rather than the cart: `validateCart` spreads the session's
 * `marketingData` over the cart's on every validation, so a value the session
 * does not know about is cleared the next time anything touches the cart. On
 * the session that same code reapplies it, and `validateSession` keeps it
 * across navigation by falling back to the session's own `utmiPart`.
 *
 * `utmiPart` rather than `utmSource`: ad platforms own the `utm_*` family and
 * overwriting those would destroy paid-campaign attribution on the order.
 */
export default function useSponsor() {
  const { query } = useRouter()
  const arbonneId = typeof query.sponsor === 'string' ? query.sponsor : ''
  const result = useSponsorById(arbonneId)

  useEffect(() => {
    if (!arbonneId || !result.sponsor) {
      return
    }

    writeSponsorAttribution(arbonneId)

    // Read through `sessionStore` rather than `useSession`, which returns a
    // filtered `channel` and two derived flags -- writing that shape back would
    // persist it.
    const session = sessionStore.read()

    if (!session || session.marketingData?.utmiPart === arbonneId) {
      return
    }

    const current = session.marketingData

    // Every field spelled out because `MarketingData` requires all six -- and
    // it keeps the preservation of the others explicit rather than incidental.
    sessionStore.set({
      ...session,
      marketingData: {
        utmCampaign: current?.utmCampaign ?? '',
        utmMedium: current?.utmMedium ?? '',
        utmSource: current?.utmSource ?? '',
        utmiCampaign: current?.utmiCampaign ?? '',
        utmiPage: current?.utmiPage ?? '',
        utmiPart: arbonneId,
      },
    })
  }, [arbonneId, result.sponsor])

  return result
}
