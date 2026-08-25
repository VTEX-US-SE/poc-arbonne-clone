import { useRouter } from 'next/router'
import type {
  ArbSponsorQueryQuery,
  ArbSponsorQueryQueryVariables,
} from '@generated/graphql'
import { useQuery } from 'src/sdk/graphql/useQuery'

import { query } from '../graphql/queries/sponsor'

/**
 * The consultant named by `?sponsor=<arbonneId>`, or `null`.
 *
 * Goes through our own resolver rather than Master Data: the storefront's
 * `/api/graphql` is served by this app, so it works the same in development as
 * in production, and the readable field list stays server-side.
 */
export default function useSponsor() {
  const { query: routeQuery } = useRouter()
  const arbonneId =
    typeof routeQuery.sponsor === 'string' ? routeQuery.sponsor : ''

  const { data, isLoading } = useQuery<
    ArbSponsorQueryQuery,
    ArbSponsorQueryQueryVariables
  >(query, { arbonneId }, { doNotRun: !arbonneId })

  return {
    sponsor: data?.arbSponsor ?? null,
    loading: Boolean(arbonneId) && isLoading,
  }
}
