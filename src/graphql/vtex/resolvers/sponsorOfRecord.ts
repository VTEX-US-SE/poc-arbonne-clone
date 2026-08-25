import storeConfig from 'discovery.config'
import { parseJwt } from 'src/utils/getCookie'

import { sponsorByArbonneId, type Sponsor } from './sponsor'

/**
 * Our own store domain, not `api.vtex.com` -- AGENTS.md forbids resolvers
 * calling the platform host directly, and the store domain proxies Master Data
 * just as happily.
 */
const base = storeConfig.storeUrl

const ACCOUNT = storeConfig.api.storeId

/**
 * `sponsorId` is a private field on `CL` -- deliberately, since it decides who
 * earns a commission -- so it needs credentials rather than the anonymous read
 * the public Sponsors List fields get. These are the storefront's own, already
 * present for server-side rendering.
 */
function credentials() {
  const appKey = process.env.FS_DISCOVERY_APP_KEY
  const appToken = process.env.FS_DISCOVERY_APP_TOKEN

  if (!appKey || !appToken) return null

  return {
    'X-VTEX-API-AppKey': appKey,
    'X-VTEX-API-AppToken': appToken,
  }
}

/**
 * The consultant a shopper is already bound to, from their own `CL` record.
 *
 * The shopper is identified from their auth cookie rather than from an argument:
 * an id passed in could be anyone's, which would turn this into a way to read
 * another customer's consultant.
 *
 * `CL.sponsorId` holds an Arbonne ID -- checkout only ever writes one that was
 * picked from the Sponsors List -- so the row it names is resolved through the
 * same lookup the landing page uses.
 */
export async function sponsorOfRecord(
  headers: Record<string, string> | undefined
): Promise<Sponsor | null> {
  // Read directly rather than through `cookie`, which ships no types in this
  // tree -- one named cookie does not need a parser.
  const match = (headers?.cookie ?? '').match(
    new RegExp(`(?:^|;\\s*)VtexIdclientAutCookie_${ACCOUNT}=([^;]+)`)
  )

  const userId = match ? parseJwt(decodeURIComponent(match[1]))?.userId : null

  if (!userId) return null

  const auth = credentials()

  if (!auth) {
    console.error('[arb] no app credentials for the sponsor of record')

    return null
  }

  // `CL.userId` is what the token carries; the document's own `id` is a
  // different value, and searching by it finds nothing.
  const search = new URLSearchParams({
    _where: `userId=${userId}`,
    _fields: 'sponsorId',
  })

  const response = await fetch(
    `${base}/api/dataentities/CL/search?${search.toString()}`,
    { headers: { ...auth, accept: 'application/vnd.vtex.ds.v10+json' } }
  )

  if (!response.ok) {
    console.error('[arb] CL lookup failed', response.status)

    return null
  }

  const rows: Array<{ sponsorId?: string | null }> = await response.json()
  const arbonneId = rows[0]?.sponsorId

  if (!arbonneId) return null

  return sponsorByArbonneId(arbonneId)
}
