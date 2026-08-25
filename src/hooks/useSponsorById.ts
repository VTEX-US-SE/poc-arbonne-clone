import type {
  ArbSponsorQueryQuery,
  ArbSponsorQueryQueryVariables,
} from '@generated/graphql'
import { useQuery } from 'src/sdk/graphql/useQuery'

import { query } from '../graphql/queries/sponsor'

/**
 * One consultant's public profile by Arbonne ID, resolved server-side.
 *
 * Shared by the landing page and the header badge -- both go through the same
 * SWR-cached query, so a page showing both makes one request.
 */
export default function useSponsorById(arbonneId: string) {
  const { data, isLoading } = useQuery<
    ArbSponsorQueryQuery,
    ArbSponsorQueryQueryVariables
  >(query, { arbonneId }, { doNotRun: !arbonneId })

  const loading = Boolean(arbonneId) && isLoading

  return {
    sponsor: data?.arbSponsor ?? null,
    loading,
    notFound: Boolean(arbonneId) && !loading && !data?.arbSponsor,
  }
}
