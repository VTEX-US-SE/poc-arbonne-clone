import { sessionStore } from 'src/sdk/session'

const COOKIE_NAME = 'arb_sponsor'

/**
 * How long a landing page's consultant stays attributed. Long enough that
 * someone who browses, leaves and returns still buys from the consultant whose
 * link they followed.
 */
const WINDOW_HOURS = 48

/**
 * Readers of the cookie, so a write reaches them without a reload.
 *
 * The header badge mounts before the landing page has resolved its consultant,
 * so a one-shot read finds nothing and the badge would only appear on the next
 * navigation. Notifying is cheaper than polling and keeps the cookie the single
 * source of truth.
 */
const listeners = new Set<() => void>()

export function subscribeSponsorAttribution(listener: () => void) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

function notify() {
  listeners.forEach((listener) => listener())
}

/** The attributed consultant's Arbonne ID, or `null`. */
export function readSponsorAttribution(): string | null {
  if (typeof document === 'undefined') {
    return null
  }

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`)
  )

  return match ? decodeURIComponent(match[1]) : null
}

/**
 * A cookie rather than `sessionStorage`: it survives a second tab, it is
 * readable server-side when the header needs to render without a flash, and it
 * carries its own expiry. Deliberately not `httpOnly` -- the header reads it
 * from the client.
 */
export function writeSponsorAttribution(arbonneId: string) {
  if (typeof document === 'undefined') {
    return
  }

  const expires = new Date(
    Date.now() + WINDOW_HOURS * 60 * 60 * 1000
  ).toUTCString()

  // `secure` is conditional because it would stop the cookie being set at all
  // over plain http, which is how the site runs locally.
  const secure = window.location.protocol === 'https:' ? '; secure' : ''

  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(
    arbonneId
  )}; path=/; expires=${expires}; samesite=lax${secure}`

  notify()
}

export function clearSponsorAttribution() {
  if (typeof document === 'undefined') {
    return
  }

  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; samesite=lax`

  notify()
}

/**
 * Puts the attributed consultant on the session, which is what carries it to the
 * order.
 *
 * Writing it onto the cart directly does not survive: `validateCart` spreads the
 * session's `marketingData` over the cart's on every validation, so a value the
 * session does not know about is cleared the next time anything touches the
 * cart. On the session that same code reapplies it.
 *
 * `utmiPart` rather than `utmSource`: ad platforms own the `utm_*` family, and
 * overwriting those would destroy paid-campaign attribution on the order.
 *
 * An empty `arbonneId` clears it. That matters after dropping a followed link
 * with no binding to fall back to -- leaving the old value would keep crediting
 * a consultant the shopper just rejected.
 */
export function writeSponsorToSession(arbonneId: string) {
  const session = sessionStore.read()

  if (!session || (session.marketingData?.utmiPart ?? '') === arbonneId) {
    return
  }

  const current = session.marketingData

  // Every field spelled out because `MarketingData` requires all six -- and it
  // keeps the preservation of the others explicit rather than incidental.
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
}
