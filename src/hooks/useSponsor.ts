import { useEffect } from 'react'
import { useRouter } from 'next/router'

import { writeSponsorAttribution } from '../utils/sponsorAttribution'
import useSponsorById from './useSponsorById'

/**
 * The consultant named by `?sponsor=<arbonneId>`, or `null`.
 *
 * Following a consultant's link is the act that attributes a visit to them, so a
 * successful lookup here is what persists it -- last link followed wins. Only
 * the cookie: the session is written from the resolved sponsor in
 * `useSponsorAttribution`, which also covers a shopper bound to a consultant
 * without following any link.
 */
export default function useSponsor() {
  const { query } = useRouter()
  const arbonneId = typeof query.sponsor === 'string' ? query.sponsor : ''
  const result = useSponsorById(arbonneId)

  useEffect(() => {
    if (arbonneId && result.sponsor) {
      writeSponsorAttribution(arbonneId)
    }
  }, [arbonneId, result.sponsor])

  return result
}
