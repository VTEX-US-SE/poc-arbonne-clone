import storeConfig from 'discovery.config'

export interface Sponsor {
  displayName?: string
  displayDescription?: string
  profilePicture?: string
  desktopImage?: string
  mobileImage?: string
  displayCollection?: string
}

/**
 * The fields a storefront visitor is allowed to see. `userId` is deliberately
 * absent: it is the CL document id, and the entity's own permissions are not
 * the only thing that should be keeping it server-side.
 */
const FIELDS: Array<keyof Sponsor> = [
  'displayName',
  'displayDescription',
  'profilePicture',
  'desktopImage',
  'mobileImage',
  'displayCollection',
]

/**
 * Our own store domain, not `vtexcommercestable` -- AGENTS.md forbids resolvers
 * calling the platform host directly, and the store domain keeps the request in
 * the store's own edge context.
 */
const base = storeConfig.storeUrl

/**
 * One consultant's public profile, by their Arbonne ID.
 *
 * Master Data enforces no uniqueness on `arbonneId`, so a duplicate resolves to
 * whichever row the search returns first. Returns `null` rather than throwing
 * when nobody matches -- an unknown `?sponsor=` is a bad link, not an error the
 * page should fail on.
 */
export async function sponsorByArbonneId(
  arbonneId: string
): Promise<Sponsor | null> {
  if (!arbonneId) {
    return null
  }

  // The store edge caches this GET by URL and ignores `Cache-Control` on the
  // request, so an edited row can serve stale for minutes. Varying the URL is
  // the only bypass -- add a throwaway param before debugging anything else.
  const search = new URLSearchParams({
    _where: `arbonneId=${arbonneId}`,
    _fields: FIELDS.join(','),
  })

  const response = await fetch(
    `${base}/api/dataentities/SL/search?${search.toString()}`,
    { headers: { accept: 'application/vnd.vtex.ds.v10+json' } }
  )

  if (!response.ok) {
    const detail = await response.text().catch(() => '')

    throw new Error(
      `Sponsor lookup failed (${response.status}): ${detail}`.trim()
    )
  }

  const rows: Sponsor[] = await response.json()

  return rows[0] ?? null
}
