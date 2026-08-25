import { useEffect } from 'react'
import { useRouter } from 'next/router'

import { writeSponsorAttribution } from '../utils/sponsorAttribution'
import useSponsorById from './useSponsorById'

/**
 * The consultant named by `?sponsor=<arbonneId>`, or `null`.
 *
 * Following a consultant's link is the act that attributes a visit to them, so
 * a successful lookup here is what persists the attribution -- last link
 * followed wins.
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
