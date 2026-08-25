import { useEffect } from 'react'
import { sessionStore } from 'src/sdk/session'

import useSponsorAttribution from './useSponsorAttribution'

/**
 * Puts the attributed consultant on the session, which is what carries it to
 * the order.
 *
 * Writing it onto the cart directly does not survive: `validateCart` spreads
 * the session's `marketingData` over the cart's on every validation, so a value
 * the session does not know about is cleared the next time anything touches the
 * cart. Putting it in the session inverts that -- the same code now reapplies
 * it -- and `validateSession` keeps it across navigation, since it falls back to
 * the session's own `utmiPart` when the URL carries no `utmi_pc`.
 *
 * `utmiPart` rather than `utmSource`: ad platforms own the `utm_*` family, and
 * overwriting those would destroy paid-campaign attribution on the order.
 *
 * Reads through `sessionStore` rather than `useSession`, which returns a
 * filtered `channel` and two derived flags -- writing that shape back would
 * persist it.
 */
export default function useAttributeSession() {
  const { arbonneId } = useSponsorAttribution()

  useEffect(() => {
    if (!arbonneId) {
      return
    }

    const session = sessionStore.read()

    // `set` deep-equals before writing, but this also avoids the cart
    // revalidation it triggers on every navigation.
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
  }, [arbonneId])
}
