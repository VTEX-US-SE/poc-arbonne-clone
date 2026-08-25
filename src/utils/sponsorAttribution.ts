const COOKIE_NAME = 'arb_sponsor'

/**
 * How long a landing page's consultant stays attributed. Long enough that
 * someone who browses, leaves and returns still buys from the consultant whose
 * link they followed.
 */
const WINDOW_HOURS = 48

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
}

export function clearSponsorAttribution() {
  if (typeof document === 'undefined') {
    return
  }

  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; samesite=lax`
}
